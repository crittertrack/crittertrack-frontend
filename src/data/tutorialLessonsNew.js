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
    id: 'gs-ownership-settings',
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
    id: 'gs-appearance-genetic-code',
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
    id: 'gs-pedigree-parent-selection',
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
      }
    ]
  },

  {
    id: 'gs-family-tab-overview',
    title: '8. Family Tab — Overview',
    description: 'Review parents, siblings, litters, and offspring in one place',
    tour: 'getting-started',
    tourOrder: 8,
    steps: [
      {
        stepNumber: 1,
        title: 'Open Family Tab',
        content: 'The Family tab contains all relationship information for your animal. It\'s optional for pets but important for breeding animals. During creation this tab is empty since you haven\'t added parents or offspring yet, but it will populate as you add that information in the Pedigree and Records tabs.',
        tips: [
          'Family tab is an overview of all relationships',
          'Parents, siblings, litters, and offspring all appear here',
          'Populates as you add pedigree and records information'
        ]
      },
      {
        stepNumber: 2,
        title: 'Parents and Siblings',
        content: 'The Family tab shows linked parents and related siblings so you can confirm your sire/dam assignments are correct. If nothing is linked yet, you will see an empty/placeholder state (for example, "No known relatives found").',
        tips: [
          'Parents are linked from the Pedigree tab',
          'Siblings appear based on shared parents'
        ]
      },
      {
        stepNumber: 3,
        title: 'Litters and Offspring',
        content: 'The Family tab also displays information about litters and offspring, allowing you to track breeding history and family lineage.',
        tips: [
          'Litters appear under the "Offspring" section',
          'Each offspring links back to their parents',
          'Helps with genetic analysis and breeding decisions'
        ]
      }
        ]
      },

  {
    id: 'gs-fertility-information',
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
        title: 'Sire Information',
        content: 'This section is available for all male animals to track fertility status and genetics information. To make your animal available as a hired stud, go to the Status tab and enable "Available for Stud" with a fee.',
        tips: [
          'Available for all males by default',
          'Track fertility status and genetics',
          'Use Status tab to set "For Stud" and fee'
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
    id: 'gs-care-tab-feeding-daily-care',
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
    id: 'gs-notes-milestones',
    title: '13. Notes & Milestones',
    description: 'Add notes, milestones, and additional information about your animal',
    tour: 'getting-started',
    tourOrder: 13,
    steps: [
      {
        stepNumber: 1,
        title: 'Notes & Milestones Tab',
        content: 'The Notes & Milestones tab is for general remarks, milestone tracking, and any additional information about your animal.',
        tips: [
          'Use for any important info that doesn\'t fit elsewhere',
          'Milestones can include breeding achievements, show wins, or personal bests',
          'Great for documenting your animal\'s unique story'
        ]
      },
      {
        stepNumber: 2,
        title: 'Notes',
        content: 'Add any observations or notes about your animal that don\'t fit in other sections. This might include personality quirks, notable achievements, breeding notes, or any other relevant information.',
        tips: [
          'Free-form text field',
          'Great for detailed observations',
          'Useful for future reference'
        ]
      },
      {
        stepNumber: 3,
        title: 'Milestones',
        content: 'Track important events or achievements in your animal\'s life. This might include breeding accomplishments, show wins, or personal bests.',
        tips: [
          'Helpful for documenting progress',
          'Can be used for marketing or breeding purposes',
          'Great for sharing your animal\'s story'
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
    title: '15. Legal & End of Life & Gallery',
    description: 'Manage legal documentation, end-of-life records and images',
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
      },
      {
        stepNumber: 9,
        title: 'Gallery Tab',
        content: 'The Gallery tab allows you to upload and manage extra images related to your animal, including photos from necropsies or other significant events.',
        tips: [
          'Upload images for documentation',
          'Helps with visual identification',
          'Valuable for genetic research'
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
        title: 'Pedigree Tab',
        content: 'On the Pedigree tab, you can see a detailed family tree chart of your animal. This shows parents, grandparents, and further back generations.',
        tips: [
          'Visual representation of pedigree',
          'Requires parent data to be useful'
        ]
      },
      {
        stepNumber: 5,
        title: 'Horizontal Pedigree Button',
        content: 'On the Pedigree tab, you can see two buttons at the top: a vertical pedigree chart and a horizontal pedigree chart. The horizontal pedigree opens in a new modal and gives you the ability to customise and show up to 4 generations of ancestors in a horizontal layout.',
        tips: [
          'Can be saved as PDF or PNG',
          'Includes manual ancestors set in edit'
        ]
      },
      {
        stepNumber: 6,
        title: 'Vertical Pedigree Button',
        content: 'On the Pedigree tab, you can see two buttons at the top: a vertical pedigree chart and a horizontal pedigree chart. The vertical pedigree opens in a new modal and gives you the ability to customise and show up to 4 generations of ancestors in a vertical layout.',
        tips: [
          'Can be saved as PDF or PNG',
          'Includes manual ancestors set in edit'
        ]
      },
      {
        stepNumber: 7,
        title: 'Edit Button',
        content: 'Click the "Edit" button in the top right corner to enter edit mode. This allows you to modify any information in the animal record.',
        tips: [
          'Edit view is almost identical to create view',
          'All tabs available for editing',
          'Changes save with the Save button'
        ]
      },
      {
        stepNumber: 8,
        title: 'Edit View Overview',
        content: 'You\'re now in the edit view. Notice it works exactly like the create form - same tabs, same fields, same Save button. You can edit any information here.',
        tips: [
          'Familiar interface from Getting Started',
          'All previous data is pre-filled',
          'Navigate tabs to edit different sections'
        ]
      },
      {
        stepNumber: 9,
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
        stepNumber: 10,
        title: 'Close Edit Without Saving',
        content: 'For now, let\'s go back to the main animal list without making changes. Click the back arrow at the top right to close edit mode and return to your list. You can always reopen an existing animal to view or edit it again.',
        tips: [
          'Back arrow closes edit mode without saving',
          'Returns you to the main animal list',
          'Your data remains unchanged',
          'You can reopen any animal anytime to view or edit'
        ]
      },
      {
        stepNumber: 11,
        title: 'Add Sibling Button',
        content: 'When viewing an animal, you\'ll see a green "Add Sibling" button next to the Edit button at the top of the detail view. Clicking it opens a blank animal creation form pre-filled with the same species, birth date, sire, and dam — saving you time when adding littermates or siblings from the same parents.',
        tips: [
          'Pre-fills species, birth date, sire, and dam if any are entered on the current animal',
          'Great for quickly adding multiple animals from the same litter',
          'You can still adjust any pre-filled field before saving'
        ]
      },
      {
        stepNumber: 12,
        title: 'Sharing Animals',
        content: 'When viewing an animal, you\'ll see a blue "Share" button next to the Transfer button at the top of the detail view. Clicking it opens a modal with a QR code and a link to the animal\'s profile.',
        tips: [
          'Anyone can scan the QR code or use the link to view this animal\'s profile',
          'Great for sharing with potential buyers or fellow breeders',
          'Sharing does not affect privacy settings - the animal will still only show details if it\'s set to public'
        ]
      },
      {
        stepNumber: 13,
        title: 'Archive Animals',
        content: 'When viewing an animal, you\'ll see a white "Archive" button at the top of the detail view. Clicking it Archives your animal and moves it to the archived section.',
        tips: [
          'Quickly view all archived animals',
          'Toggle back to view all animals',
          'Archived animals are not deleted and can be unarchived anytime',
          'Archived animals stay visible in pedigrees unless you set them to private'
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
        title: 'Open + Mating First',
        content: 'Start with "+ Mating" when you want to record a planned breeding. Clicking it opens the planned mating modal.',
        tips: [
          'Planned matings can only be created for current or future dates',
        ]
      },
      {
        stepNumber: 3,
        title: 'Choose Species in the Mating Modal',
        content: 'Inside the planned mating modal, click the Species field and pick the correct species from the picker. Selecting a species clears any parent selections so the sire and dam search can be filtered correctly for that species.',
        tips: [
          'Both parents are mandatory',
          'Can only use same species animals',
          'Inclusive gender selection available'
        ]
      },
      {
        stepNumber: 4,
        title: 'Select Sire and Dam',
        content: 'After the species is set, choose the sire and dam for the planned mating. The sire and dam buttons are only enabled once a species has been selected. When both parents are chosen, the modal can show a predicted COI, and the parent cards are now tied to the correct species.',
        tips: [
          'Both parents are mandatory',
          'Can only use same species animals',
          'Inclusive gender selection available'
        ]
      },
      {
        stepNumber: 5,
        title: 'Add Mating Date and Expected Due Date',
        content: 'Fill in the mating date and the expected due date.',
        tips: [
          'Both dates show on litter calendar'
        ]
      },
      {
        stepNumber: 6,
        title: 'Add Mating Details and Optional Notes',
        content: 'open the optional breeding details area if you want to record the breeding method or the breeding condition at the time. Add notes if you want a freeform reminder before saving the planned mating.',
        tips: [
                ]
      },
      {
        stepNumber: 7,
        title: 'Save the Planned Mating',
        content: 'Save the planned mating to close the modal and store it as Planned. Planned matings appear on the calendar and in the list with a blue "Planned" badge. You can click on a planned mating to view its details, edit it, or convert it to a born litter once the breeding is successful.',
        tips: [
                ]
      },
      {
        stepNumber: 8,
        title: 'Open + Litter Next',
        content: 'When you are recording an actual birth, click "+ Litter" to open the litter modal. This is a separate form from the mating modal, but it follows the same first rule: select the species inside the modal before selecting parents.',
        tips: [
                ]
      },
      {
        stepNumber: 9,
        title: 'Choose Species in the Litter Modal',
        content: 'Inside the litter modal, click the Species field and pick the correct species from the picker. Selecting a species clears any parent selections so the sire and dam search can be filtered correctly for that species.',
        tips: [
          'Both parents are mandatory',
          'Can only use same species animals',
          'Inclusive gender selection available'
        ]
      },
      {
        stepNumber: 10,
        title: 'Select Sire and Dam',
        content: 'After the species is set, choose the sire and dam for the litter. The sire and dam buttons are only enabled once a species has been selected. When both parents are chosen, the modal can show a predicted COI, and the parent cards are now tied to the correct species.',
        tips: [
          'Both parents are mandatory',
          'Can only use same species animals',
          'Inclusive gender selection available'
        ]
      },
      {
        stepNumber: 11,
        title: 'Add Litter Photos',
        content: 'Upload photos of the litter to document their appearance and development.',
        tips: [
          'Photos help with identification and tracking',
          'Include close-ups of the offspring and their parents',
          'Ensure photos are clear and well-lit'
        ]
      },
      {
        stepNumber: 12,
        title: 'Set Pair Name (Optional)',
        content: 'Fill in Litter Name/ID (your pair name or internal code), The litter name field stores your custom pairing label.',
        tips: [
          'Optional field for your internal use',
        ]
      },
      {
        stepNumber: 13,
        title: 'Complete Breeding Information',
        content: 'The Breeding Information section lets you fill the fields: Breeding Method, Breeding Condition, Breeding Outcome, Mating Date, Expected Due Date, and Birth Method. This section captures the pairing context before the birth and offspring totals are finalized.',
        tips: [
          'Mating Dates and Expected Due Dates show on calendar',
        ]
      },
      {
        stepNumber: 14,
        title: 'Record Dates & Counts',
        content: 'Enter the expected due date or birth date, then fill the male, female, and unknown offspring counts. Total Born is calculated as males + females + unknown. Stillborn, losses, and weaned are free-form fields you can use as needed for your litter record.',
        tips: [
          'Birthdate is mandatory for new offspring creation',
          'Total Born = males + females + unknown',
          'Stillborn/losses/weaned are free-form fields',
          'Birth or due date helps with offspring creation and reporting'
        ]
      },
      {
        stepNumber: 15,
        title: 'Create New Offspring Animals',
        content: 'In the "Create New Offspring Animals" section, you will see total set, already linked and remaining counts. The "add/fill remaining" buttons create new animals records with parent links auto-filled to this litter\'s sire and dam. The number of animals created at once is determined by the remaining count. This is a great way to quickly create placeholder records for all offspring in a litter, which you can then edit with individual details later.',
        tips: [
          'Requires both parents and a birth date',
          'Creates placeholder animals with parent links auto-filled',
          'Use this when offspring records do not exist yet',
          'Saved offspring are linked to the litter automatically'
        ]
      },
      {
        stepNumber: 16,
        title: 'Link Existing Animals',
        content: 'Use "Link Existing Animals as Offspring" to connect previously created animals to this litter. Only animals with the same parents are shown. If no birth date is set on the litter yet, selecting an existing offspring will auto-fill the litter birth date from that animal.',
        tips: [
          'Parents are required to find matching existing offspring',
          'Shows only animals with the same sire and dam',
          'Linking an existing animal auto-fills the litter birth date if missing',
          'Great for completing the family tree with already-created offspring'
        ]
      },
      {
        stepNumber: 17,
        title: 'Mating Card Details',
        content: 'Once you\'ve created a Planned Mating, click on a Mating card to expand and view its details. The "Mated Today" button allows you to mark the mating as completed for the day and this will auto-set mating date to current date.',
        tips: [
          'Requires a planned mating to be created first',
          'Shows complete mating information',
          'Edit the planned mating from here',
          'View parentage clearly'
        ]
      },
      {
        stepNumber: 18,
        title: 'Mating Edit and Convert to Litter',
        content: 'Once you\'ve created a Mating, click on the Edit button in expanded view to modify its details. The convert to litter functionality allows you to convert the mating record to a full litter record.',
        tips: [
          'Requires a mating to be created first',
          'Edit the planned mating from here'
                ]
      },
      {
        stepNumber: 19,
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
        stepNumber: 20,
        title: 'Show pairings on Your Public Profile',
        content: 'Each card has an Eye / EyeOff icon at the very left of the compact header, before the pair name. Click it to toggle public visibility: green Eye = this entry is shown on your public breeder profile, grey EyeOff = hidden. A "Pairings" tab automatically appears on your public profile once at least one entry is marked public. The public cards shows the optional pair name, litter ID badge, sire × dam, status badge (Planned / Mated / Born), dates grouped by status, and any notes.',
        tips: [
          'Eye/EyeOff icon is the first element on each pairing card',
          'Green Eye = shown publicly, Grey EyeOff = hidden from profile',
          'pairings tab only appears on your public profile when at least 1 pairing is public',
          'Notes are always shown when a pairing is public',
          'Works for both planned, mated and born pairings/litters'
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
        content: 'Let\'s explore your profile settings. Click your profile image in the top right corner and click the "Profile" button in the dropdown menu.',
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
        title: 'Websites & Country',
        content: 'Add your websites (if you have a breeding website and/or social media profiles), select your country, and write a bio. The bio helps tell other breeders about yourself and your breeding program. These help other users find and learn about you.',
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
        title: 'Ratings Tab',
        content: 'In your Settings, open the "Ratings" tab to manage reviews and ratings for your breeding program. This allows you to view feedback from other users.',
        tips: [
          'Found under Settings → Ratings tab',
          'Helps build trust with potential customers'
        ]
      },
      {
        stepNumber: 13,
        title: 'Breeding Lines Tab',
        content: 'In your Settings, open the "Breeding Lines" tab to Define up to 10 personal breeding lines. These are private and only visible to you, This helps you manage and track genetic diversity within your breeding program.',
        tips: [
          'Found under Settings → Breeding Lines tab',
          'Assign breeding lines to animals on the Identification Tab in private view-mode',
          'Helps manage genetic diversity'
        ]
      },
      {
        stepNumber: 14,
        title: 'Data Portability Tab',
        content: 'In your Settings, open the "Data Portability" tab to manage your data and import/export your breeding information.',
        tips: [
          'Found under Settings → Data Portability tab',
          'Export your data for backup or analysis',
          'Import data from other systems',
          'Manage your data with ease'
        ]
      },
      {
        stepNumber: 15,
        title: 'Account Tab',
        content: 'In your Settings, open the "Account" tab to manage your Email and Password. This is also where you can delete your account if needed.',
        tips: [
          'Found under Settings → Account tab',
          'Manage login credentials',
          'Account deletion is permanent' 
        ]
      }
    ]
  },

  {
    id: 'kf-global-calendar',
    title: '4. Calendar & Reminders',
    description: 'Track all events and important dates in one place',
    tour: 'key-features',
    tourOrder: 4,
    steps: [
      {
        stepNumber: 1,
        title: 'Calendar View',
        content: 'The Calendar page shows all your events and important dates in one place.',
        tips: [
          'Shows all events and dates',
          'Helps plan breeding',
          'includes custom milestones you create on animals',
          'Tracks important milestones'
        ]
      },
      {
        stepNumber: 2,
        title: 'Event Filters',
        content: 'Click the Event buttons to filter events on your calendar.',
        tips: [
          'Filter by event type',
          'Focus on specific categories',
          'Customizable event types'
        ]
      },
      {
        stepNumber: 3,
        title: 'Month Events List',
        content: 'Shows all events for the selected month in a list format.',
        tips: [
          'Easy overview of monthly events',
        ]
      },
      {
        stepNumber: 4,
        title: 'Click Calendar Events for Details',
        content: 'Shows all expanded details below the calendar.',
        tips: [
        ]
      },
      {
        stepNumber: 5,
        title: 'Reminders',
        content: 'Reminders and Alerts show up as events on the calendar and in the Reminders section. Click on a reminder to see its details and mark it as completed.',
        tips: [
        ]
      }
          ]
  },

  {
    id: 'kf-budget-transfers',
    title: '5. Budget & Animal Transfers',
    description: 'Track finances and manage animal transfers',
    tour: 'key-features',
    tourOrder: 5,
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
        title: 'Add Transaction - Income',
        content: 'Click the "Add Transaction" button and select "Income". This records revenue like animal sales, donations, grants, etc.',
        tips: [
          'Income increases net profit',
          'Important for accurate tracking',
          'Includes all revenue sources'
        ]
      },
      {
        stepNumber: 5,
        title: 'Income Fields',
        content: 'On the Income form, fill in: Date, Category (sales, donations, grants, other), Description, Amount, and optional notes. This creates a detailed income record.',
        tips: [
          'Categorize for better tracking',
          'Be specific in description',
          'Notes help remember details'
        ]
      },
      
      {
        stepNumber: 6,
        title: 'Animal Sale - Manual Entry',
        content: 'Select "Animal Sale" then "Manual Entry". This records a sale without using the transfer system - you just record the basic sale details manually.',
        tips: [
          'Manual entry is simple',
          'Good for external sales',
          'No system integration'
        ]
      },
      {
        stepNumber: 7,
        title: 'Manual Sale Fields',
        content: 'Enter: Date, Animal (if you want to link it), Buyer, Sale Price, and Notes. This creates a record of the transaction.',
        tips: [
          'Simple transaction entry',
          'Works for any animal',
          'Records sale history'
        ]
      },
      {
        stepNumber: 8,
        title: 'Close & Reopen - Transfer Ownership',
        content: 'Let\'s look at Transfer Ownership, which is more sophisticated. Close this, reopen Add Transaction, select "Animal Sale", then "Transfer Ownership".',
        tips: [
          'Transfer creates relationships',
          'Both users stay connected',
          'Recommended for CritterTrack users'
        ]
      },
      {
        stepNumber: 9,
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
        stepNumber: 10,
        title: 'Transfer Button on Detail View',
        content: 'Access this feature directly from animal detail by clicking the blue "Transfer" button.',
        tips: [
          'Quick access from animal detail',
          'Initiates transfer process',
          'Follow prompts to complete transfer'
        ]
      },
      {
        stepNumber: 11,
        title: 'Close & Reopen - Animal Purchase',
        content: 'Now let\'s look at purchases. Close this, reopen Add Transaction, and select "Animal Purchase". Since manual entry is the same as sales, we\'ll focus on the "Notify Seller" option.',
        tips: [
          'Purchase is the other side of sale',
          'Notify Seller is special feature',
          'Creates community connections'
        ]
      },
      {
        stepNumber: 12,
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
    id: 'kf-searching-filtering',
    title: '6. Searching & Filtering',
    description: 'Master search and filtering tools',
    tour: 'key-features',
    tourOrder: 6,
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
        stepNumber: 3,
        title: 'Species Filter',
        content: 'In your "My Animals" filters section, use the Species dropdown to filter your collection by animal type. Combine this with the search bar for quick access to specific animals.',
        tips: [
          'Filter your collection by type',
          'Narrows down results quickly',
          'Works with name search above',
          'Helps organize large collections'
        ]
      },
      {
        stepNumber: 4,
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
        stepNumber: 5,
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
        stepNumber: 6,
        title: 'Combined Filtering',
        content: 'Use multiple filters together: search by name, filter by species and gender, then by status. This gives you powerful tools to find exactly what you\'re looking for in your collection.',
        tips: [
          'Layer multiple filters',
          'Quick specific searches',
          'Very flexible organization',
          'Manage large collections easily'
        ]
      },
      {
        stepNumber: 7,
        title: 'Breeding Lines Filter',
        content: 'Filter by breeding lines to quickly find animals in specific breeding lines within your collection.',
        tips: [
          'Find specific breeding lines',
          'Track lineage information',
          'Manage genetic diversity'
        ]
      }
    ]
  },

  {
    id: 'kf-my-feed-community-updates',
    title: '7. My Feed & Community Updates',
    description: 'Stay informed about your favorites and the community',
    tour: 'key-features',
    tourOrder: 7,
    steps: [
      {
        stepNumber: 1,
        title: 'Open My Feed',
        content: 'Use the My Feed button in the main navigation to open the community hub. This is where you can see active users, newest users, and see updates about your favorited users/animals.',
        tips: [
          'Stay connected to community',
          'Never miss important info',
          'Customizable preferences'
        ]
      },
      {
        stepNumber: 2,
        title: 'Favorite Animals Button',
        content: 'Favorite animals of other users to see updates about them in your My Feed.',
        tips: [
        ]
      },
      {
        stepNumber: 3,
        title: 'Favorite Animals Section',
        content: 'Favorite animals of other users to see updates about them in this section.',
        tips: [
        ]
      },
      {
        stepNumber: 4,
        title: 'Recently Updated Favorites',
        content: 'This section shows recently updated information about your favorited animals.',
        tips: [
        ]
      },
      {
        stepNumber: 5,
        title: 'Favorite Users Button',
        content: 'Favorite other users in the community to see their updates in your My Feed. This is a great way to stay connected to breeders you\'re interested in.',
        tips: [
        ]
      },
      {
        stepNumber: 6,
        title: 'Favorite Users Section',
        content: 'Favorite other users in the community to see their updates occur here. This is a great way to stay connected to breeders you\'re interested in.',
        tips: [
        ]
      },
      {
        stepNumber: 7,
        title: 'Available from Favorited Breeders',
        content: 'This section shows all available animals from breeders you\'ve favorited. This is a great way to discover new prospects for your breeding program.',
        tips: [
        ]
     }
    ]
  },

  {
    id: 'kf-notifications',
    title: '8. Notification System',
    description: 'Stay informed with notifications',
    tour: 'key-features',
    tourOrder: 8,
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
        content: 'When someone initiates an animal transfer to you, you\'ll be notified.',
        tips: [
          'Receive transfer requests',
          'View transfer details',
          'Accept or decline requests'
        ]
      },
      {
        stepNumber: 3,
        title: 'Sire/Dam Notifications',
        content: 'Receive alerts when your animals are assigned as parents in breeding programs. users can auto-assign your animals as sire or dam if they are public. You\'ll get a notification whenever this happens, so you can stay informed about how your animals are being used in the community and decline requests if necessary (this reverts the assignment).',
        tips: [
          'Know when your animals are used in breeding',
          'Stay informed about breeding activity',
          'See lineage connections'
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
    id: 'kf-messaging',
    title: '9. Messaging System',
    description: 'Communicate with other breeders',
    tour: 'key-features',
    tourOrder: 9,
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
        title: 'System News & Updates',
        content: 'Receive alerts about important system events, updates, or maintenance in the Reminders & News section on the dashboard. These are typically low-priority but keep you informed.',
        tips: [
          'Stay informed about platform changes',
          'Know about new features',
          'Understand any issues'
        ]
      }
    ]
  }
];

const ADVANCED_FEATURES_LESSONS = [
    {
    id: 'af-daily-operations-tabs',
    title: '1. Daily Operations Tabs',
    description: 'Use the separate tabs in My Animals for enclosures, reproduction, health, feeding, and supplies management',
    tour: 'advanced-features',
    tourOrder: 1,
    steps: [
            {
        stepNumber: 1,
        title: 'How Daily Operations Are Organized',
        content: 'Daily operations are split into focused tabs. Use Enclosures for habitat assignment/maintenance, Reproduction for breeding status workflows, Health for care and medical actions, Feeding & Care for feeding workflows, and Supplies for inventory management.',
        tips: [
        ]
      },
      {
        stepNumber: 2,
        title: 'My Animals List View',
        content: 'On the right side of the search bar / filters button is a toggle that lets you switch views.',
        tips: [
          'Toggle between grid and list view',
          'List view shows more details in a compact format',
          'Great for managing large collections'
        ]
      },
      {
        stepNumber: 3,
        title: 'Collections Tab',
        content: 'The Collections tab lets you create named groups of animals that cut across species and ownership. Add animals to a collection, and use the search bar to filter animals within it. Great for organising show animals, or any custom grouping you need for your own tracking.',
        tips: [
        ]
      },
      {
        stepNumber: 4,
        title: 'Enclosures Tab',
        content: 'The Enclosures tab shows your habitats, assigned animals. Create/edit enclosures and manage assignments directly from this tab.',
        tips: [
        ]
      },
      {
        stepNumber: 5,
        title: 'Reproduction Tab',
        content: 'Use the Reproduction tab for breeding status workflows such as In Mating, Pregnant, and Nursing progressions.',
        tips: [
        ]
      },
      {
        stepNumber: 6,
        title: 'Health Tab — Scheduled Care and Medical',
        content: 'Use the Health tab for managing scheduled care and medical treatments.',
        tips: [
        ]
      },
      {
        stepNumber: 7,
        title: 'Quarantine Flow',
        content: 'Quarantine and medical status actions are handled in health-related workflows. Assign animal in quarantine in the animal edit health tab, then use the health tab to see all animals in quarantine and manage their care and eventual release.',
        tips: [
        ]
      },
      {
        stepNumber: 8,
        title: 'Feeding & Care Tab — Due and Overdue Tasks',
        content: 'The Feeding & Care tab highlights animals needing feeding actions, including due/overdue states driven by each animal\'s care schedule. This is the main daily feeding workflow tab.',
        tips: [
        ]
      },
      {
        stepNumber: 9,
        title: 'Recording a Feeding',
        content: 'Click the green "✓ Fed" button on any animal to record a feeding. A modal opens where you can optionally select which food item from your Supplies was used, enter the quantity fed (which automatically deducts from your stock), and add notes. You can also skip food selection and just mark the animal as fed Or use the skip button to entirely skip a feeding.',
        tips: [
        ]
      },
      {
        stepNumber: 10,
        title: 'Accessing Supplies',
        content: 'Supplies is accessed via the supplies tab in the My Animals header. It\'s a dedicated screen for tracking everything you use to care for your animals, from food and bedding to medication and feeder animals.',
        tips: [
          'Accessible from within My Animals',
          'Separate from the main animal list',
          'Filter by category: Food, Bedding, Medication, Other'
        ]
      },
      {
        stepNumber: 11,
        title: 'Adding a Supply Item',
        content: 'Click "Add Item" to create a new supply. Give it a name, select a category (Food, Bedding, Medication, Other), and enter the current stock amount and unit (e.g. "15 bags" or "200 grams"). Optionally set a Cost Per Unit for budget tracking.',
        tips: [
          'Name: e.g. "Timothy Hay", "Deli Nature Premium", "Adult Mice"',
          'Units can be anything: bags, grams, kg, pieces',
          'Cost Per Unit flows into budget expenses on restock'
        ]
      },
      {
        stepNumber: 12,
        title: 'Feeder Animal Items',
        content: 'Food items can be marked as "Feeder Animal" to unlock extra fields: Feeder Type (e.g. Mice, Rats, Crickets) and Feeder Size (e.g. Pinky, Fuzzy, Adult, Large). These details appear in feeding logs when you select the item during a feeding event.',
        tips: [
          'Only available for Food category items',
          'Feeder type and size shown in feeding log entries',
          'Useful for reptile and amphibian keepers'
        ]
      },
      {
        stepNumber: 13,
        title: 'Reorder Thresholds',
        content: 'Set a "Reorder when stock reaches" threshold so you\'re alerted automatically. When current stock drops to or below this number, the item appears in the Management View\'s maintenance section and the maintenance badge count increases.',
        tips: [
          'Good starting point: 1-2 weeks\' worth of supply',
          'Badge on Management View section changes color when reorder is due',
          'Restock button lets you quickly add stock and optionally log the cost'
        ]
      },
      {
        stepNumber: 14,
        title: 'Schedule-Based Reorder',
        content: 'For bulk items where stock count isn\'t practical (like hay bales or substrate bags), use schedule-based reordering. Set a "Next Order Date" and an order frequency (e.g. every 2 months). The item will appear in alerts when the next order date arrives, independent of stock count.',
        tips: [
          'Great for subscription feeds or regular bulk orders',
          'Frequency: days, weeks, or months',
          'Next Order Date auto-advances when you restock'
        ]
      },
      {
        stepNumber: 15,
        title: 'Restocking',
        content: 'Click "Restock" on any item to add to your running stock. Enter the quantity received and optionally the cost paid — this automatically creates a budget expense entry. After restocking, any overdue reorder date is automatically advanced to the next cycle.',
        tips: [
          'Restock logs a budget expense automatically',
          'You can edit or delete transactions later in Budget',
          'Stock level updates immediately'
        ]
      },
      {
        stepNumber: 16,
        title: 'Pin Your Default View',
        content: 'Each top tab has a small pin icon in its top-right corner. Click the pin on any tab to make it your default, so opening Crittertrack lands on that view automatically.',
        tips: [
        ]
      }
    ]
  },

  {
    id: 'af-tags-management',
    title: '2. Tags & Mass Management',
    description: 'Organize animals with tags and bulk operations',
    tour: 'advanced-features',
    tourOrder: 2,
    steps: [
      {
        stepNumber: 1,
        title: 'Tags Overview',
        content: 'Tags are custom labels you create to organize your collection. Tags are public to other users.',
        tips: [
          'Flexible organization system',
          'Create your own tags',
          'Multiple tags per animal'
        ]
      },
      {
        stepNumber: 2,
        title: 'Adding Tags',
        content: 'In the animal form, find the Tags field on the identification tab. Type a tag name and press Enter to add it. Tags can be new or existing from your tag list.',
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
        content: 'At the top of the My Animals page, you\'ll see "Set All Public" and "Set All Private" buttons. These let you instantly change the visibility of ALL your animals at once. The UI updates immediately, and changes sync with the database in the background.',
        tips: [
          'Green Eye icon = Make All Public',
          'Gray Eye-Off icon = Make All Private',
          'Changes apply instantly to all animals',
          'Also optional per species by eye icons in species headers',
          'Background sync keeps database updated',
          'Confirmation prompt before applying'
        ]
      },
      {
        stepNumber: 5,
        title: 'Mass Delete',
        content: 'Click the trash icon in species headers to enter mass delete mode. Select multiple animals using checkboxes, then click "Delete Selected" to remove them all at once.',
        tips: [
          'Efficient for large collections',
          'Delete multiple animals at once',
          'Click Cancel to exit without deleting'
        ]
      },
      {
        stepNumber: 6,
        title: 'For Sale Button',
        content: 'Click the "For Sale" button on the top header of My Animals to show animals marked For Sale.',
        tips: [
          'Quickly view all animals for sale',
          'Toggle back to view all animals'
        ]
      },
      {
        stepNumber: 7,
        title: 'Archive Button',
        content: 'Click the "Archive" button on the top header of My Animals to show archived animals.',
        tips: [
          'Quickly view all archived animals',
          'Toggle back to view all animals'
        ]
      },
      {
        stepNumber: 8,
        title: 'Find Duplicates Button',
        content: 'Click the "Find Duplicates" button on the top header of My Animals to show animals with possible duplicate entries.',
        tips: [
          'Identify potential duplicate records',
          'Review and merge duplicates to keep your database clean'
        ]
      }
    ]
  },

  {
    id: 'af-public-profiles',
    title: '3. Public Profiles & Sharing',
    description: 'Share your breeding program with the community',
    tour: 'advanced-features',
    tourOrder: 3,
    steps: [
      {
        stepNumber: 1,
        title: 'Public Profile Overview',
        content: 'Your public profile is how other breeders find and learn about you. It is organised into up to six tabs that appear automatically once you have content: Animals (always visible), For Sale / Stud (appears when you have animals marked for sale or stud), Info & Adoption (appears when you have breeder info filled in Settings), Pairings (appears when you have at least one pairing toggled public in Litter Management), Stats and Ratings.',
        tips: [
          'Tabs appear automatically — no manual setup needed',
          'Animals tab is always shown',
          'For Sale / Stud tab requires animals marked for sale or stud',
          'Info & Adoption tab requires fields filled in Settings',
          'Pairings tab requires at least one pairing toggled public',
          'Stats and Ratings tab shows your breeding statistics'
        ]
      },
      {
        stepNumber: 2,
        title: 'Animals Tab',
        content: 'The "Animals" tab shows all your owned and public animals, organized by species. Users can filter by name, species, gender or status.',
        tips: [
          'Shows all owned and public animals',
          'Organized by species',
          'Search and filter available',
          'Great for showcasing your breeding stock'
        ]
      },
      {
        stepNumber: 3,
        title: 'Info & Adoption Tab',
        content: 'The "Info & Adoption" tab shows your breeding program information as collapsible accordions: About My Program, Adoption Rules, Care Requirements, Health Guarantee, Waitlist Info, Pricing Notes, Contact Preferences, and any custom fields you have added. Fill these fields in Settings → Info & Adoption tab. The tab is hidden if none of the fields are filled.',
        tips: [
          'Fill fields in Profile Settings → Info & Adoption tab',
          'Only filled sections are shown publicly',
          'Up to 10 custom fields with your own titles',
          'Formatting (bold, italic) is preserved in the public view',
          'Tab is hidden entirely if no fields are filled'
        ]
      },
      {
        stepNumber: 4,
        title: 'Pairings Tab',
        content: 'The "Pairings" tab shows pairings you have chosen to share publicly. Toggle any pairing public using the Eye / EyeOff icon on each pairing card in Litter Management. Public pairing cards display the pair name and ID, sire × dam names, a status badge (Planned, Mated or Born), relevant dates, and your notes. Pairings are grouped into Planned, Mated and Past (born).',
        tips: [
          'Toggle per-pairing from Litter Management (Eye icon at start of card)',
          'Planned, Mated and Born pairings appear in separate groups',
          'Notes are shown if present',
          'Tab hidden until at least one pairing is set public'
        ]
      },
      {
        stepNumber: 5,
        title: 'For Sale / Stud Tab',
        content: 'The "For Sale / Stud" tab shows two sections: animals you have listed for sale and animals available for stud services. Animals appear here when they are both set to Public AND have "Available for Sale" or "Available for Stud" enabled in their Ownership tab. Visitors can see the optional price/fee, gender, species, and photo at a glance.',
        tips: [
          'Animal must be Public AND marked For Sale or For Stud',
          'Set price/fee or mark as Negotiable',
          'Tab is hidden if you have no animals listed',
          'Also feeds into the "Available Animals" section in the header'
        ]
      },
      {
        stepNumber: 6,
        title: 'Stats Tab',
        content: 'The "Stats" tab shows all your breeding statistics: total animals, total breeders, total litters, and more. This is a great way to showcase the scope and success of your breeding program.',
        tips: [
          'Shows comprehensive breeding statistics',
          'Includes totals for animals, breeders, litters, and more',
          'Great for showcasing your program\'s success',
          'only shows stats for public animals and pairings'
        ]
      },
      {
        stepNumber: 7,
        title: 'Ratings Tab',
        content: 'The "Ratings" tab shows all your breeding ratings and reviews from other breeders. This is a great way to build credibility and showcase the quality of your breeding program. Visiting this tab on another breeder allows you to rate this user.',
        tips: [
          'Shows ratings and reviews from other breeders',
          'Builds credibility in the community',
          'Encourages high-quality breeding practices',
          'Allows visitors to rate your program'
        ]
      },
      {
        stepNumber: 8,
        title: 'Sharing Profiles',
        content: 'Click the "Share Profile" button on any profile to open a modal with a QR code and a link to copy the unique link to your clipboard. You can share this link with other breeders so they can view your full profile.',
        tips: [
          'Share your profile with other breeders',
          'Use the unique link or QR code',
          'Great for social media, forums, or direct sharing'
        ]
      }
    ]
  },

  {
    id: 'af-available-animals',
    title: '4. Available Animals',
    description: 'Browse and discover animals available for sale or stud',
    tour: 'advanced-features',
    tourOrder: 4,
    steps: [
      {
        stepNumber: 1,
        title: 'Overview',
        content: 'This page lets you browse animals that breeders have marked as "Available for Sale" or "Available for Stud". Only animals that are both marked as available AND have their public profile enabled will appear here.',
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
        content: 'When viewing an animal, you can contact the breeder through the blue message button on the animal card or on their public profile to inquire about availability, ask questions, or arrange a purchase or stud service.',
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
        content: 'The Breeders Registry helps you find active breeders of specific species. Click the star/moon icon in the header to access it. Breeders can mark themselves as "Active Breeder" or "Retired Breeder" for each species in their profile settings.',
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
        content: 'In your Profile Settings, you can mark yourself as an "Active Breeder", "Retired Breeder", or "Owner" for each species you keep. Active and Retired breeders appear in the directory. This is optional - you only appear if you choose to.',
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
    id: 'af-test-pairing',
    title: '6. Test Pairing',
    description: 'Test pairing animals to predict offspring traits and target outcomes',
    tour: 'advanced-features',
    tourOrder: 6,
    steps: [
      {
        stepNumber: 1,
        title: 'Test Pairing Overview',
        content: 'The button is located on the Litter Management page. Clicking this button will open the Test Pairing tool that includes a COI calculator and Trait Calculator.',
        tips: [
          'Access from Litter Management',]
      },
      {
        stepNumber: 2,
        title: 'Using the Test Pairing Tool - COI Calculator',
        content: 'Once opened, the COI Calculator allows you to input parent animals and predict COI for their potential offspring. The COI calculator helps assess genetic diversity.',
        tips: [
          'Input parent animals',
          'Assess genetic diversity'
        ]
      },
      {
        stepNumber: 3,
        title: 'What is COI?',
        content: 'The Coefficient of Inbreeding (COI) is a mathematical measure of genetic diversity. It ranges from 0% (no common ancestors) to 100% (completely inbred).',
        tips: [
          '0% = maximum diversity',
          '100% = completely inbred',
          'Important metric for breeding decisions'
        ]
      },
      {
        stepNumber: 4,
        title: 'Why COI Matters',
        content: 'COI helps breeders understand the genetic relationship between ancestors in a pedigree. Monitoring COI allows breeders to make informed decisions about their breeding programs.',
        tips: [
          'Genetics matter',
          'Track genetic relationships',
          'Use COI in breeding decisions'
        ]
      },
      {
        stepNumber: 5,
        title: 'Using the Test Pairing Tool - Trait Calculator',
        content: 'The Trait Calculator helps you plan breeding goals by predicting the likelihood of achieving specific traits in offspring based on parent genetics. Click Trait chips to set them as targets and see the reproductive probabilities within your current breeding animals.',
        tips: [
          'Set breeding goals',
          'Predict trait inheritance',
          'Plan for desired outcomes',
          'Only works with species with defined genetic loci in the Genetic Code Builder (e.g. Fancy Mice)'
        ]
      }
        ]
      },

      {
    id: 'af-genetics-calculator',
    title: '7. Genetics Calculator',
    description: 'Use the genetics calculator to predict offspring traits',
    tour: 'advanced-features',
    tourOrder: 7,
    steps: [
      {
        stepNumber: 1,
        title: 'Genetics Calculator Overview',
        content: 'Click the "Calculator" button in the header to access the Genetics Calculator - a tool for predicting offspring genetic traits. It works with species like Fancy Mice that have defined genetic loci.',
        tips: [
          'Predict offspring appearance',
          'Understand inheritance',
          'Plan trait combinations'
        ]
      },
      {
        stepNumber: 2,
        title: 'Set Species',
        content: 'Click the dropdown menu in the header to switch species - Currently only for Fancy Mice & Fancy Rats.',
        tips: [
          'Select species for accurate predictions',
          'Currently only supports Fancy Mice and Fancy Rats',
          'More species coming in the future'
        ]
      },
      {
        stepNumber: 3,
        title: 'Selecting Animals',
        content: 'You can freely enter genes OR Click the "Select Animal" buttons to choose parents from your collection. Their genetic codes are automatically filled in when you select them.',
        tips: [
          'Use your animals',
          'Genetic code auto-fills',
          'Pre-populate parents'
        ]
      },
      {
        stepNumber: 4,
        title: 'Genetic Loci',
        content: 'Each genetic locus represents a trait. Select the combination for each parent using the dropdowns if you want to free-form calculation without entered parents. The Sire (father) section is blue and the Dam (mother) section is pink.',
        tips: [
          'One row per genetic trait',
          'Select parent genotypes',
          'System shows options'
        ]
      },
      {
        stepNumber: 5,
        title: 'Calculate Offspring',
        content: 'First, select genetic combinations for both parents (or input "a/a" for both as a test). Then click "Calculate Offspring" to see all possible outcomes.',
        tips: [
          'Both parents must have selections',
          'Button activates when ready',
          'Results show all possibilities'
        ]
      },
      {
        stepNumber: 6,
        title: 'Predicted Offspring',
        content: 'The "Possible Offspring Outcomes" section shows all possible combinations and their probabilities. Click on combinations to see phenotypes (appearance) and any special notes.',
        tips: [
          'See all possibilities',
          'Probabilities shown',
          'Plan desired traits'
        ]
      },
      {
        stepNumber: 7,
        title: 'Phenotype Information',
        content: 'Each phenotype (appearance) is displayed with relevant information like colors, markings, and any lethal or problematic combinations highlighted in red.',
        tips: [
          'Avoid lethal combinations',
          'Plan for traits',
          'Understand genetics'
        ]
      }
    ]
  },

  {
    id: 'af-animal-tree',
    title: '8. Family Tree',
    description: 'View your animals in an interactive family tree by species',
    tour: 'advanced-features',
    tourOrder: 8,
    steps: [
      {
        stepNumber: 1,
        title: 'Family Tree Overview',
        content: 'The Family Tree tab provides a visual tree for each species, showing your account animals and their linked lineage. Open it from the main view tabs in My Animals.',
        tips: [
          'Visualize lineage connections',
          'See parents and offspring',
          'Great for understanding breeding history'
        ]
      },
      {
        stepNumber: 2,
        title: 'Species-Specific Trees',
        content: 'The top left shows a species dropdown. Selecting a species displays its family tree.',
        tips: [
          'Select species to view',
          'Only shows animals of that species',
          'Switch between species easily'
        ]
      },
      {
        stepNumber: 3,
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
        stepNumber: 4,
        title: 'Search in Tree',
        content: 'Use the focus search bar to find specific animals by name or ID. Search recenters to the first match and sets focus, making it easy to find specific animals in large trees.',
        tips: [
          'Search by name or ID',
          'Recenters to first match',
          'Sets focus for easy navigation'
        ]
      },
      {
        stepNumber: 5,
        title: 'Connections and Mobile Access',
        content: 'Lines connect parents and offspring, with highlights available for ancestors and descendants. On smaller screens, the Family Tree tab is disabled for usability and appears only on larger viewports.',
        tips: [
          'Lines show parent-child relationships',
          'Highlights for ancestors and descendants',
          'Disabled on smaller screens for usability'
        ]
      }
    ]
  },

   {
    id: 'af-animal-logs',
    title: '9. Animal Logs Tab & Activity Log',
    description: 'View the full history of feedings, care changes, and field edits on any individual animal',
    tour: 'advanced-features',
    tourOrder: 9,
    steps: [
      {
        stepNumber: 1,
        title: 'What Is the Logs Tab?',
        content: 'Every animal has a "Logs 📜" button in their detail view. This is a complete, automatically-generated history of everything that has happened to that animal — feedings recorded, care schedule changes, and any field edits made. You don\'t need to do anything special — it builds itself as you use the app.',
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
      },
      {
        stepNumber: 5,
        title: 'Activity Log',
        content: 'Every action you take in Daily Operations — feeding, care tasks, enclosure tasks, quarantine releases, repro changes — is recorded in the Activity Log. Access it via the activity log button in the My Animals header. You can filter by action type, animal, or date range to review what was done and when.',
        tips: [
          'Great for accountability and handover to other caretakers',
          'Filter by action type to find specific events',
          'Feeding events show which food and quantity was used'
        ]
      }      
    ]
  },
  {
    id: 'af-donation-platform-support',
    title: '10. Donation & Platform Support',
    description: 'Use the donation page to support platform development',
    tour: 'advanced-features',
    tourOrder: 10,
    steps: [
      {
        stepNumber: 1,
        title: 'Open Donation',
        content: 'Visit the donation page by clicking the heart icon in the top left corner to support platform development and help us continue improving CritterTrack.',
        tips: [
          'Every contribution helps',
          'Supports ongoing development',
          'Helps us keep the platform free for all users'
        ]
      },
      {
        stepNumber: 2,
        title: 'Am I obligated to donate?',
        content: 'No, donating is completely voluntary. However, any contribution you make helps us continue improving CritterTrack and keeping it free for all users. There are ways to purchase items in the shop that also support the platform if you\'d like to contribute without donating directly.',
        tips: [
          'Donation is voluntary',
          'Every bit helps us improve',
          'Shop purchases also support the platform'
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
