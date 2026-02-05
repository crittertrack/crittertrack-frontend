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
        highlightElement: '[data-tutorial-target="add-animal-btn"]',
        actionType: 'click',
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
        highlightElement: '[data-tutorial-target="default-species-section"]',
        tips: [
          'Default species cannot be deleted',
          'They are available to all users on the platform',
          'You can add custom species in addition to these'
        ]
      },
      {
        stepNumber: 3,
        title: 'Species Search Bar',
        content: 'Use the search bar to find species by name. You can also filter by category (Rodent, Mammal, Reptile, etc.) to narrow down your options.',
        highlightElement: '[data-tutorial-target="species-search-section"]',
        tips: [
          'Search is case-insensitive',
          'Category filter helps organize species',
          'Both default and custom species can be searched'
        ]
      },
      {
        stepNumber: 4,
        title: 'Add New Species Button',
        content: 'In the bottom right corner, you\'ll see the highlighted "Add New Species" button. Click it to create a custom species for your collection. Let\'s explore how to add a custom species.',
        highlightElement: '[data-tutorial-target="add-species-btn"]',
        actionType: 'click',
        tips: [
          'Custom species are visible only to you',
          'You can add them to any category',
          'Latin/Scientific names are optional but recommended'
        ]
      },
      {
        stepNumber: 5,
        title: 'Species Name',
        content: 'Enter the name of your custom species here. This is the display name that will appear throughout your collection.',
        highlightElement: '[data-tutorial-target="species-name-input"]',
        tips: [
          'Use clear, descriptive names',
          'Can be specific or general',
          'Examples: "Ball Python", "Corn Snake", "Leopard Gecko"'
        ]
      },
      {
        stepNumber: 6,
        title: 'Category Selection',
        content: 'Select a category that best fits your species. This helps organize your species list and makes searching easier. Categories include Rodent, Mammal, Reptile, Bird, Amphibian, Fish, Invertebrate, and Other.',
        highlightElement: '[data-tutorial-target="species-category-dropdown"]',
        actionType: 'click',
        tips: [
          'Choose the most specific category available',
          'You can change this later',
          'The "Other" category is available if no category fits'
        ]
      },
      {
        stepNumber: 7,
        title: 'Latin/Scientific Name',
        content: 'Enter the scientific name of your species here. This is optional but highly recommended for clarity and accuracy. For example, a Fancy Mouse\'s scientific name is "Mus musculus".',
        highlightElement: '[data-tutorial-target="species-latin-input"]',
        tips: [
          'Scientific names follow Latin nomenclature',
          'Format: Genus species',
          'This information helps other breeders understand your animals better'
        ]
      },
      {
        stepNumber: 8,
        title: 'Return to Species Selector',
        content: 'Now let\'s go back to select a default species for your animal. Click the highlighted "Back to Selector" button to return to the species list.',
        highlightElement: '[data-tutorial-target="back-to-selector-btn"]',
        actionType: 'click',
        tips: [
          'You can create more custom species anytime',
          'For this tutorial, we\'ll use a default species',
          'Your custom species will be available for future animals'
        ]
      },
      {
        stepNumber: 9,
        title: 'Select Fancy Mouse',
        content: 'For this tutorial, select "Fancy Mouse" from the species list. This will give us access to all the advanced features like the genetic code builder.',
        highlightElement: '[data-tutorial-target="species-fancy-mouse"]',
        actionType: 'click',
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
        content: 'Click here to upload a photo of your animal. A clear, front-facing photo works best. You can update this anytime.',
        highlightElement: '[data-tutorial-target="animal-image-upload"]',
        actionType: 'click',
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
        highlightElement: '[data-tutorial-target="animal-name-section"]',
        actionType: 'click',
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
        highlightElement: '[data-tutorial-target="animal-gender-select"]',
        actionType: 'click',
        tips: [
          'Intersex and Unknown are available for non-binary animals',
          'Gender affects breeding features',
          'Can be changed anytime'
        ]
      },
      {
        stepNumber: 5,
        title: 'Date of Birth',
        content: 'Enter when your animal was born. This is important for tracking age and health records. If unknown, you can enter an approximate date.',
        highlightElement: '[data-tutorial-target="animal-birthdate-input"]',
        actionType: 'click',
        tips: [
          'Format: YYYY-MM-DD',
          'Use your best estimate if exact date unknown',
          'This affects the animal\'s life stage'
        ]
      },
      {
        stepNumber: 6,
        title: 'Status Selection',
        content: 'Select the current status of your animal. Options include: Pet (living animal in your collection), Breeder (breeding animal), Available (for sale), Booked (reserved/spoken for), Sold (sold to someone else), Retired (no longer breeding), Deceased (passed away), Rehomed (given to another home), or Unknown. Choose what best describes your animal\'s current situation.',
        highlightElement: '[data-tutorial-target="animal-status-select"]',
        actionType: 'click',
        tips: [
          'Status affects visibility and features available',
          'Can be changed as your animal\'s situation changes',
          'Important for record-keeping and breeding planning'
        ]
      },
      {
        stepNumber: 7,
        title: 'Save vs Continue',
        content: 'Notice the Save button at the bottom. All information in the form is held temporarily until you click Save. For now, DON\'T click Save yet - let\'s explore the other tabs first. Click the "Status & Privacy" tab to continue.',
        highlightElement: '[data-tutorial-target="status-privacy-tab"]',
        actionType: 'click',
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
    title: '4. Status & Privacy Settings',
    description: 'Configure ownership and visibility settings',
    tour: 'getting-started',
    tourOrder: 4,
    steps: [
      {
        stepNumber: 1,
        title: 'Welcome to Status & Privacy',
        content: 'This tab controls who owns, manages, and can see your animal. Let\'s walk through each setting.',
        highlightElement: '[data-tutorial-target="status-privacy-tab"]',
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
        highlightElement: '[data-tutorial-target="ownership-section"]',
        tips: [
          'Click to search for registered breeders',
          'Search by name or ID across the platform',
          'Use Manual Name field for non-registered breeders',
          'Tracks breeding history and lineage'
        ]
      },
      {
        stepNumber: 3,
        title: 'Current Owner Section',
        content: 'This section tracks ownership. Check "Currently Owned by Me" if you own the animal. The Owner Name field lets you record the owner\'s name for your records and builds an ownership history.',
        highlightElement: '[data-tutorial-target="current-owner-field"]',
        tips: [
          'Checkbox: Currently owned vs previously owned',
          'Owner Name: Records for tracking',
          'Ownership history is automatically maintained',
          'Useful when transferring animals'
        ]
      },
      {
        stepNumber: 4,
        title: 'Availability for Sale or Stud',
        content: 'Use this section to make your animal available in the public Marketplace. When you enable "Available for Sale" or "Available for Stud", the price/fee fields will appear inline below the checkbox. Set your desired currency and amount (or select Negotiable). Only public animals marked for sale or stud will appear in the Marketplace.',
        highlightElement: '[data-tutorial-target="availability-for-sale-stud"]',
        tips: [
          'Enable "Available for Sale" to list with a price',
          'Enable "Available for Stud" to offer breeding services',
          'When enabled, currency and amount fields appear below',
          'Select currency (USD/EUR/GBP/CAD/AUD/JPY) or Negotiable',
          'Requires Public Profile to be enabled (on Overview tab)',
          'Public + For Sale/Stud = appears in Marketplace'
        ]
      },
      {
        stepNumber: 5,
        title: 'Move to Physical Tab',
        content: 'Now let\'s continue to the Physical tab to add more details about your animal\'s physical characteristics. Click the "Physical" tab.',
        highlightElement: '[data-tutorial-target="physical-tab"]',
        actionType: 'click',
        tips: [
          'Each tab adds more specific information',
          'You can skip tabs and come back',
          'Everything saves together at the end'
        ]
      }
    ]
  },

  {
    id: 'gs-physical',
    title: '5. Physical Characteristics & Genetic Code',
    description: 'Document color, coat, genetics, and measurements',
    tour: 'getting-started',
    tourOrder: 5,
    steps: [
      {
        stepNumber: 1,
        title: 'Physical Characteristics',
        content: 'This tab is where you record detailed physical information about your animal, including appearance and genetic information.',
        highlightElement: '[data-tutorial-target="physical-tab"]',
        tips: [
          'All information here is optional',
          'It helps with breeding decisions',
          'Genetic info is especially important for breeders'
        ]
      },
      {
        stepNumber: 2,
        title: 'Color',
        content: 'Enter the color of your animal\'s coat. Examples: Black, White, Brown, Grey, Spotted, etc. Be as specific as you need for your records.',
        highlightElement: '[data-tutorial-target="appearance-section"]',
        actionType: 'click',
        tips: [
          'Use standard color names or your own system',
          'This helps identify and track traits',
          'Combined with coat type for full description'
        ]
      },
      {
        stepNumber: 3,
        title: 'Coat Type',
        content: 'Specify the texture of your animal\'s coat. Common options: Short hair, Long hair, Curly, Wavy, Hairless, etc.',
        highlightElement: '[data-tutorial-target="appearance-section"]',
        actionType: 'click',
        tips: [
          'Coat type is genetic',
          'Important for breeding selection',
          'Different species have different coat types'
        ]
      },
      {
        stepNumber: 4,
        title: 'Coat Pattern',
        content: 'Describe any patterns in the coat. Examples: Solid, Striped, Spotted, Banded, Dalmatian, etc.',
        highlightElement: '[data-tutorial-target="appearance-section"]',
        actionType: 'click',
        tips: [
          'Pattern is often genetic',
          'Helps identify specific animals',
          'Important for selective breeding'
        ]
      },
      {
        stepNumber: 5,
        title: 'Genetic Code - The ADD Button',
        content: 'This is where you can enter genetic information about your animal. Click the ADD button next to Genetic Code to open the genetic builder.',
        highlightElement: '[data-tutorial-target="genetic-code-add-btn"]',
        actionType: 'click',
        tips: [
          'Genetic codes are complex',
          'Not required, but highly recommended for breeders',
          'The builder is only available for Fancy Mice currently',
          'Other species use manual entry'
        ]
      },
      {
        stepNumber: 6,
        title: 'Genetic Builder Overview',
        content: 'Welcome to the Genetic Code Builder! This tool helps you document the genetic traits of your animal. You can select genes using dropdown menus (available for Fancy Mouse) or switch to manual mode to enter genetics for any species.',
        actionType: 'click',
        tips: [
          'Dropdown mode available for Fancy Mouse',
          'Manual mode available for all species',
          'Both methods produce the same result',
          'Click "Switch to Manual" to continue'
        ]
      },
      {
        stepNumber: 7,
        title: 'Close Genetic Builder',
        content: 'Let\'s go back to the Physical tab. Click the Cancel button to close this builder.',
        actionType: 'click',
        tips: [
          'You can always come back to add genetic info',
          'Nothing is saved until you click Save on the main form',
          'Genetic codes are optional'
        ]
      },
      {
        stepNumber: 8,
        title: 'Life Stage',
        content: 'Select the current life stage of your animal: Newborn (just born), Juvenile (young), Adult (mature), Senior (elderly), or Unknown. This is calculated based on the species and date of birth but can be manually adjusted.',
        highlightElement: '[data-tutorial-target="life-stage-select"]',
        tips: [
          'Affects health monitoring and breeding eligibility',
          'Auto-calculated but customizable',
          'Used for record organization'
        ]
      },
      {
        stepNumber: 9,
        title: 'Measurements & Growth Tracking',
        content: 'This section tracks your animal\'s physical measurements over time. This is particularly useful for monitoring growth, health, and development. Let\'s add some sample measurements.',
        highlightElement: '[data-tutorial-target="measurements-growth-section"]',
        tips: [
          'Track weight and length over time',
          'Helps monitor health trends',
          'Can identify growth issues early'
        ]
      },
      {
        stepNumber: 10,
        title: 'Measurement Units',
        content: 'First, select your preferred units: Metric (kg, cm) or Imperial (lbs, inches). Choose whichever you\'re most comfortable with.',
        highlightElement: '[data-tutorial-target="measurement-units-select"]',
        tips: [
          'You can change this anytime',
          'Affects all measurements for this animal',
          'Important for accuracy'
        ]
      },
      {
        stepNumber: 11,
        title: 'Add First Measurement',
        content: 'Now let\'s add a tutorial measurement. Enter the date 1/1/2026, weight 450, and length 20. Then click Add Measurement.',
        highlightElement: '[data-tutorial-target="add-measurement-btn"]',
        tips: [
          'Date: Use recent or estimated date',
          'Weight: In your selected units',
          'Length: In your selected units',
          'Both weight and length are optional'
        ]
      },
      {
        stepNumber: 12,
        title: 'Add Second Measurement',
        content: 'Let\'s add another measurement with today\'s date, weight 500, and length 30. This shows growth over time.',
        highlightElement: '[data-tutorial-target="add-measurement-btn"]',
        tips: [
          'Multiple measurements show trends',
          'The system calculates growth rate',
          'Useful for monitoring health'
        ]
      },
      {
        stepNumber: 13,
        title: 'View Growth Chart',
        content: 'Notice the "Current Measurements" section shows your latest measurement, and the "Growth Curve" chart visualizes how your animal has grown over the dates you entered. This helps you monitor development.',
        highlightElement: '[data-tutorial-target="current-measurements-growth-chart"]',
        tips: [
          'Chart updates automatically with new measurements',
          'Shows growth trajectory',
          'Helps identify health concerns'
        ]
      },
      {
        stepNumber: 14,
        title: 'Move to Identification Tab',
        content: 'Let\'s continue to the Identification tab to add ID numbers and classification. Click the "Identification" tab.',
        highlightElement: '[data-tutorial-target="identification-tab"]',
        actionType: 'click',
        tips: [
          'Each tab builds on previous information',
          'All data is temporary until you Save',
          'Can navigate freely between tabs'
        ]
      }
    ]
  },

  {
    id: 'gs-identification',
    title: '6. Identification & Classification',
    description: 'Set up identification numbers, breeds, and tags',
    tour: 'getting-started',
    tourOrder: 6,
    steps: [
      {
        stepNumber: 1,
        title: 'Identification Tab',
        content: 'This tab helps you uniquely identify your animal using multiple identification systems and classification information.',
        highlightElement: '[data-tutorial-target="identification-tab"]',
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
        highlightElement: '[data-tutorial-target="identification-breeder-id"]',
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
        highlightElement: '[data-tutorial-target="microchip-input"]',
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
        highlightElement: '[data-tutorial-target="registration-id-input"]',
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
        highlightElement: '[data-tutorial-target="classification-section"]',
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
        highlightElement: '[data-tutorial-target="breed-select"]',
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
        highlightElement: '[data-tutorial-target="strain-input"]',
        tips: [
          'Optional but valuable for breeders',
          'Tracks genetic lines',
          'Examples: "Jackson Black Line", "Siamese Point Strain"'
        ]
      },
      {
        stepNumber: 8,
        title: 'Tags Feature',
        content: 'Tags allow you to categorize and organize your animals. You can create custom tags like "Show Animal", "Breeding Stock", "Pet", "For Sale", etc. Add tags by typing and pressing Enter.',
        highlightElement: '[data-tutorial-target="tags-section"]',
        actionType: 'click',
        tips: [
          'Tags help organize your collection',
          'Create your own tag system',
          'Can search and filter by tags',
          'One animal can have multiple tags'
        ]
      },
      {
        stepNumber: 9,
        title: 'Move to Lineage Tab',
        content: 'Let\'s continue to the Lineage tab to set up parent information and build your animal\'s pedigree. Click the "Lineage" tab.',
        highlightElement: '[data-tutorial-target="lineage-tab"]',
        actionType: 'click',
        tips: [
          'Lineage is crucial for breeders',
          'Helps track pedigree',
          'Enables COI (Coefficient of Inbreeding) calculations'
        ]
      }
    ]
  },

  {
    id: 'gs-lineage',
    title: '7. Lineage & Pedigree',
    description: 'Set up parent information and view pedigree',
    tour: 'getting-started',
    tourOrder: 7,
    steps: [
      {
        stepNumber: 1,
        title: 'Lineage Tab',
        content: 'This tab tracks your animal\'s parents and allows viewing of the pedigree chart. This is crucial for understanding genetics and calculating inbreeding coefficients.',
        highlightElement: '[data-tutorial-target="lineage-tab"]',
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
        highlightElement: '[data-tutorial-target="select-sire-btn"]',
        actionType: 'click',
        tips: [
          'Sire must be the same species',
          'Sire is typically male (but not always)',
          'Search in Local Animals (yours) or Global (community)'
        ]
      },
      {
        stepNumber: 3,
        title: 'Parent Search System',
        content: 'This modal lets you search for the sire. Notice the buttons for "Local" (your animals), "Global" (community animals), and "Both". You can also search by name or ID. The system only shows animals that match your current animal\'s species and the correct gender.',
        highlightElement: '[data-tutorial-target="parent-search-modal"]',
        hideHighlightPrompt: true,
        tips: [
          'Local Animals: Your collection only',
          'Global Animals: Community collection',
          'Both: Search everywhere',
          'Gender filter ensures correct parentage'
        ]
      },
      {
        stepNumber: 4,
        title: 'Close Sire Selector',
        content: 'For now, let\'s close this selector without selecting a parent. Click the X button in the top right corner of the modal to close it.',
        highlightElement: '[data-tutorial-target="modal-close-btn"]',
        hideHighlightPrompt: true,
        actionType: 'close',
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
        content: 'This selector is for non-binary, intersex, or agender animals. It works the same way as the Sire selector but allows selection of any gender. This is important for inclusive genetics tracking.',
        highlightElement: '[data-tutorial-target="select-other-parent-btn"]',
        tips: [
          'Allows selection of Intersex/Unknown genders',
          'Same search functionality as Sire/Dam',
          'Helps track diverse pedigrees'
        ]
      },
      {
        stepNumber: 6,
        title: 'Origin Information',
        content: 'Select the origin of your animal: "Captive-Bred" (domestically bred), "Wild-caught" or "Rescue". This helps track where your animals come from.',
        highlightElement: '[data-tutorial-target="origin-select"]',
        tips: [
          'Helps track breeding history',
          'Important for COI calculations',
          'Affects lineage tracking'
        ]
      },
      {
        stepNumber: 7,
        title: 'Ownership History',
        content: 'This section shows who has owned this animal throughout its life. If you purchased it from another breeder, their information would be tracked here. This creates a complete history of the animal.',
        highlightElement: '[data-tutorial-target="ownership-history"]',
        tips: [
          'Auto-populated when animal is transferred',
          'Shows all previous owners',
          'Helps verify provenance'
        ]
      },
      {
        stepNumber: 8,
        title: 'Move to Breeding Tab',
        content: 'Let\'s continue to the Breeding tab to learn about reproductive information. Click the "Breeding" tab.',
        highlightElement: '[data-tutorial-target="breeding-tab"]',
        actionType: 'click',
        tips: [
          'Breeding info is optional for pets',
          'Important for breeding animals',
          'Can be filled in later'
        ]
      }
    ]
  },

  {
    id: 'gs-breeding',
    title: '8. Breeding Information',
    description: 'Track reproductive status and breeding history',
    tour: 'getting-started',
    tourOrder: 8,
    steps: [
      {
        stepNumber: 1,
        title: 'Breeding Tab',
        content: 'This tab contains all reproductive information for your animal. It\'s optional for pets but important for breeding animals.',
        highlightElement: '[data-tutorial-target="breeding-tab"]',
        tips: [
          'Skip if not planning to breed',
          'Complete if breeding animal',
          'Can be updated anytime'
        ]
      },
      {
        stepNumber: 2,
        title: 'Reproductive Status',
        content: 'These checkboxes indicate your animal\'s reproductive status. When checked, they affect how the animal appears in breeding selectors and what features are available.',
        highlightElement: '[data-tutorial-target="reproductive-status-section"]',
        tips: [
          'Neutered/Infertile: Cannot breed',
          'Affects breeding availability',
          'Can be changed as status changes'
        ]
      },
      {
        stepNumber: 3,
        title: 'Estrus & Cycle Information',
        content: 'For females, you can track estrus cycle information. This includes the cycle length and timing, helping you plan breeding.',
        highlightElement: '[data-tutorial-target="estrus-cycle-section"]',
        tips: [
          'Important for breeding scheduling',
          'Species-specific cycles',
          'Can be estimated or tracked'
        ]
      },
      {
        stepNumber: 4,
        title: 'Mating & Pregnancy',
        content: 'Check this box if your animal is currently mating or pregnant. This flag helps track breeding status.',
        highlightElement: '[data-tutorial-target="mating-pregnancy-checkbox"]',
        tips: [
          'Temporary status during breeding',
          'Uncheck when breeding complete',
          'Important for health monitoring'
        ]
      },
      {
        stepNumber: 5,
        title: 'Nursing Status',
        content: 'Check this box if your female is currently nursing offspring. This affects her health needs and breeding availability.',
        highlightElement: '[data-tutorial-target="nursing-checkbox"]',
        tips: [
          'Typically temporary status',
          'Important for health records',
          'Affects breeding decisions'
        ]
      },

      {
        stepNumber: 6,
        title: 'Stud Information',
        content: 'If your animal is a stud (breeding male), track his fertility status and genetics information here. To make him available for breeding in the showcase, go to the Status & Privacy tab and enable "Available for Stud" with a fee.',
        highlightElement: '[data-tutorial-target="stud-info-section"]',
        tips: [
          'Track sire fertility status',
          'Add genetics/fertility notes',
          'Use Status tab to set "For Stud" and fee',
          'Public + "For Stud" = Appears in showcase'
        ]
      },
      {
        stepNumber: 7,
        title: 'Dam Information',
        content: 'If your animal is a dam (breeding female), fill in her fertility status and any genetics or fertility-related notes about her.',
        highlightElement: '[data-tutorial-target="dam-info-section"]',
        tips: [
          'Track fertility status',
          'Add genetics/fertility notes',
          'Optional for breeding females'
        ]
      },
      {
        stepNumber: 8,
        title: 'Breeding History',
        content: 'This section lets you record a brief summary of your animal\'s reproductive events. First select if this animal was a Sire, Dam, or Both. Then fill in mating dates, successful matings count, total offspring produced, total litters, and date of last pregnancy.',
        highlightElement: '[data-tutorial-target="breeding-history-section"]',
        tips: [
          'Select Sire, Dam, or Both',
          'Fill in reproductive summary',
          'Helps track breeding productivity'
        ]
      },
      {
        stepNumber: 9,
        title: 'Move to Health Tab',
        content: 'Let\'s continue to the Health tab to track medical information. Click the "Health" tab.',
        highlightElement: '[data-tutorial-target="health-tab"]',
        actionType: 'click',
        tips: [
          'Health is important for all animals',
          'Track preventive and emergency care',
          'Helps maintain good records'
        ]
      }
    ]
  },

  {
    id: 'gs-health',
    title: '9. Health & Medical Records',
    description: 'Track preventive care and medical history',
    tour: 'getting-started',
    tourOrder: 9,
    steps: [
      {
        stepNumber: 1,
        title: 'Health Tab',
        content: 'This tab tracks all health-related information for your animal, including preventive care, procedures, medical history, and veterinary visits.',
        highlightElement: '[data-tutorial-target="health-tab"]',
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
        highlightElement: '[data-tutorial-target="preventive-care-section"]',
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
        highlightElement: '[data-tutorial-target="procedures-section"]',
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
        highlightElement: '[data-tutorial-target="medical-history-section"]',
        tips: [
          'Complete medical records are valuable',
          'Track chronic conditions',
          'Share with future owners'
        ]
      },
      {
        stepNumber: 5,
        title: 'Veterinary Care',
        content: 'Keep information about your veterinarian and record of visits, including dates, reasons for visit, and treatment provided.',
        highlightElement: '[data-tutorial-target="vet-care-section"]',
        tips: [
          'Helps track veterinary history',
          'Important for continuity of care',
          'Useful if changing vets'
        ]
      },
      {
        stepNumber: 6,
        title: 'Move to Husbandry Tab',
        content: 'Let\'s continue to the Husbandry tab to document care and living conditions. Click the "Husbandry" tab.',
        highlightElement: '[data-tutorial-target="husbandry-tab"]',
        actionType: 'click',
        tips: [
          'Husbandry is how you care for the animal',
          'Important for quality of life',
          'Helps maintain good practices'
        ]
      }
    ]
  },

  {
    id: 'gs-husbandry',
    title: '10. Husbandry & Care Conditions',
    description: 'Document nutrition, housing, and environment',
    tour: 'getting-started',
    tourOrder: 10,
    steps: [
      {
        stepNumber: 1,
        title: 'Husbandry Tab',
        content: 'This tab documents how you care for your animal - nutrition, housing, and environmental conditions. Good records here ensure consistent quality care.',
        highlightElement: '[data-tutorial-target="husbandry-tab"]',
        tips: [
          'Consistent care improves animal welfare',
          'Helps if you ever need to rehome',
          'Documents your care practices'
        ]
      },
      {
        stepNumber: 2,
        title: 'Nutrition',
        content: 'Document your animal\'s diet: what food brands you use, feeding schedules, supplements, and any dietary restrictions or preferences.',
        highlightElement: '[data-tutorial-target="nutrition-section"]',
        tips: [
          'Consistent nutrition is important',
          'Track what works for your animal',
          'Useful for new caretakers'
        ]
      },
      {
        stepNumber: 3,
        title: 'Husbandry Details',
        content: 'Record cage/enclosure setup, bedding type, and any other husbandry details specific to your care method. (Temperature, humidity, and lighting schedule are tracked in the Environment section.)',
        highlightElement: '[data-tutorial-target="husbandry-details-section"]',
        tips: [
          'Species-specific requirements vary',
          'Consistency helps animal thrive',
          'Important for breeding animals'
        ]
      },
      {
        stepNumber: 4,
        title: 'Environment',
        content: 'Document the broader environmental conditions: room temperature, humidity levels, lighting (day/night cycle), and any special environmental enrichment.',
        highlightElement: '[data-tutorial-target="environment-section"]',
        tips: [
          'Environment affects behavior and health',
          'Important for breeding success',
          'Track seasonal variations'
        ]
      },
      {
        stepNumber: 5,
        title: 'Move to Behavior Tab',
        content: 'Let\'s continue to the Behavior tab to document personality and behavior traits. Click the "Behavior" tab.',
        highlightElement: '[data-tutorial-target="behavior-tab"]',
        actionType: 'click',
        tips: [
          'Behavior reflects health and temperament',
          'Important for breeding decisions',
          'Helps with animal handling'
        ]
      }
    ]
  },

  {
    id: 'gs-behavior',
    title: '11. Behavior & Personality',
    description: 'Track behavior, temperament, and activity patterns',
    tour: 'getting-started',
    tourOrder: 11,
    steps: [
      {
        stepNumber: 1,
        title: 'Behavior Tab',
        content: 'This tab documents your animal\'s personality, behavior traits, and activity patterns. These observations are valuable for understanding your animal and for breeding decisions.',
        highlightElement: '[data-tutorial-target="behavior-tab"]',
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
        highlightElement: '[data-tutorial-target="behavior-items-section"]',
        tips: [
          'Detailed observations are valuable',
          'Behavioral traits can be heritable',
          'Track changes over time'
        ]
      },
      {
        stepNumber: 3,
        title: 'Activity Pattern',
        content: 'Select your animal\'s main activity pattern: Nocturnal (active at night), Diurnal (active during day), or Crepuscular (active at dawn/dusk). This helps you understand your animal\'s natural schedule.',
        highlightElement: '[data-tutorial-target="activity-pattern-select"]',
        tips: [
          'Species-determined mostly',
          'Helps plan observation time',
          'Important for breeding schedules',
          'Examples: Mice are nocturnal, hamsters are crepuscular'
        ]
      },
      {
        stepNumber: 4,
        title: 'Move to Records Tab',
        content: 'Let\'s continue to the Records tab to add notes and documentation. Click the "Records" tab.',
        highlightElement: '[data-tutorial-target="records-tab"]',
        actionType: 'click',
        tips: [
          'Records is where general notes go',
          'Good place for additional observations',
          'Final before saving'
        ]
      }
    ]
  },

  {
    id: 'gs-records-eol',
    title: '12. Records & End of Life',
    description: 'Add notes and document end-of-life information',
    tour: 'getting-started',
    tourOrder: 12,
    steps: [
      {
        stepNumber: 1,
        title: 'Records Tab',
        content: 'This tab is for general notes, remarks, and any additional information about your animal.',
        highlightElement: '[data-tutorial-target="records-tab"]',
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
        highlightElement: '[data-tutorial-target="remarks-section"]',
        tips: [
          'Free-form text field',
          'Great for detailed observations',
          'Useful for future reference'
        ]
      },
      {
        stepNumber: 3,
        title: 'Move to End of Life Tab',
        content: 'Now let\'s look at the End of Life tab where you document end-of-life information. Click the "End of Life" tab.',
        highlightElement: '[data-tutorial-target="end-of-life-tab"]',
        actionType: 'click',
        tips: [
          'Optional for living animals',
          'Important when animal passes',
          'Completes the record'
        ]
      },
      {
        stepNumber: 4,
        title: 'Date of Death',
        content: 'When your animal passes away, enter the date of death here. This automatically updates the animal\'s status to "Deceased".',
        highlightElement: '[data-tutorial-target="date-of-death-input"]',
        tips: [
          'Marks end of active record',
          'Status changes to Deceased',
          'Important for complete records'
        ]
      },
      {
        stepNumber: 5,
        title: 'Cause of Death',
        content: 'Document what caused your animal\'s death: natural causes, illness, predation, accident, etc. This helps with understanding health patterns.',
        highlightElement: '[data-tutorial-target="cause-of-death-input"]',
        tips: [
          'Helps track health issues',
          'Useful for breeding decisions',
          'Important for complete records'
        ]
      },
      {
        stepNumber: 6,
        title: 'Necropsy Results',
        content: 'If a necropsy (animal autopsy) was performed, document the findings here. This is valuable medical information.',
        highlightElement: '[data-tutorial-target="necropsy-results-textarea"]',
        tips: [
          'Professional necropsy provides details',
          'Helps understand health issues',
          'Valuable for genetics research'
        ]
      },
      {
        stepNumber: 7,
        title: 'Legal & Administrative',
        content: 'Document any legal or administrative aspects of the animal\'s passing: burial location, cremation, organ donation, etc.',
        highlightElement: '[data-tutorial-target="legal-admin-section"]',
        tips: [
          'Some may be required in your area',
          'Document disposal method',
          'Keep records for compliance'
        ]
      },
      {
        stepNumber: 8,
        title: 'Move to Show Tab',
        content: 'Now let\'s check out the Show tab where you can document titles, ratings, and accomplishments. Click the "Show" tab.',
        highlightElement: '[data-tutorial-target="show-tab"]',
        actionType: 'click',
        tips: [
          'Track titles and awards',
          'Record competition results',
          'Document your animal\'s achievements'
        ]
      }
    ]
  },

  {
    id: 'gs-show',
    title: '13. Show Titles & Accomplishments',
    description: 'Document show titles, ratings, and achievements',
    tour: 'getting-started',
    tourOrder: 13,
    steps: [
      {
        stepNumber: 1,
        title: 'Show Tab',
        content: 'This tab is where you document your animal\'s show titles, ratings, judge comments, and any accomplishments from competitions or events.',
        highlightElement: '[data-tutorial-target="show-tab"]',
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
        highlightElement: '[data-tutorial-target="show-titles-section"]',
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
        highlightElement: '[data-tutorial-target="judge-comments-textarea"]',
        tips: [
          'Valuable feedback for breeders',
          'Helps identify strengths',
          'Useful for breeding decisions',
          'Can guide future showing strategy'
        ]
      },
      {
        stepNumber: 4,
        title: 'Tutorial Complete!',
        content: 'Congratulations! You\'ve completed the Getting Started tour and learned about all the tabs and features for documenting your animals in CritterTrack. You can now create and manage your collection with confidence.',
        tips: [
          'You can create more animals anytime',
          'Edit animals at any time',
          'All information is preserved',
          'Explore the Key Features tour next'
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
        highlightElement: '[data-tutorial-target="animal-card"]',
        hideHighlightPrompt: true,
        actionType: 'click',
        tips: [
          'Each animal has a complete record',
          'Shows all tabs of information',
          'View-only by default'
        ]
      },
      {
        stepNumber: 2,
        title: 'Private Toggle',
        content: 'The private/public toggle controls whether this entire animal appears on your public profile. When set to private (gray Eye-Off icon), only you can see it. When public (green Eye icon), everyone can view it. You can find this toggle at the top right of the detail overview screen. Changes apply instantly!',
        highlightElement: '[data-tutorial-target="detail-private-toggle"]',
        tips: [
          'Located at top right of detail view',
          'Green Eye = Public, Gray Eye-Off = Private',
          'Controls whole animal visibility',
          'Can be toggled anytime - updates instantly'
        ]
      },
      {
        stepNumber: 3,
        title: 'Pedigree Chart Button',
        content: 'On the Lineage tab, you can click the "View Pedigree" button to see a detailed family tree chart of your animal. This shows parents, grandparents, and further back generations. When you\'re done viewing, close this pedigree screen by clicking the X or close button.',
        highlightElement: '[data-tutorial-target="pedigree-btn"]',
        tips: [
          'Visual representation of pedigree',
          'Requires parent data to be useful',
          'Can be downloaded as PDF',
          'Close the pedigree screen when done'
        ]
      },
      {
        stepNumber: 4,
        title: 'Edit Button',
        content: 'Click the "Edit" button in the top right corner to enter edit mode. This allows you to modify any information in the animal record.',
        highlightElement: '[data-tutorial-target="edit-animal-btn"]',
        actionType: 'click',
        tips: [
          'Edit view is almost identical to create view',
          'All tabs available for editing',
          'Changes save with the Save button'
        ]
      },
      {
        stepNumber: 5,
        title: 'Edit View Overview',
        content: 'You\'re now in the edit view. Notice it works exactly like the create form - same tabs, same fields, same Save button. You can edit any information here.',
        highlightElement: '[data-tutorial-target="edit-form"]',
        hideHighlightPrompt: true,
        tips: [
          'Familiar interface from Getting Started',
          'All previous data is pre-filled',
          'Navigate tabs to edit different sections'
        ]
      },
      {
        stepNumber: 6,
        title: 'Delete Button',
        content: 'When you\'re in edit mode, you can find the Delete button (usually in red) at the bottom of the form. This allows you to remove an animal from your collection entirely. Warning: This action cannot be undone, so use with caution.',
        highlightElement: '[data-tutorial-target="delete-animal-btn"]',
        tips: [
          'Located in edit mode at the bottom',
          'Permanent action - cannot undo',
          'Cannot delete animals with offspring',
          'Consider marking as Deceased instead'
        ]
      },
      {
        stepNumber: 7,
        title: 'Close Edit Without Saving',
        content: 'For now, let\'s go back to the main animal list without making changes. Click the back arrow at the top right to close edit mode and return to your list. You can always reopen an existing animal to view or edit it again.',
        highlightElement: '[data-tutorial-target="close-edit-btn"]',
        hideHighlightPrompt: true,
        actionType: 'click',
        tips: [
          'Back arrow closes edit mode without saving',
          'Returns you to the main animal list',
          'Your data remains unchanged',
          'You can reopen any animal anytime to view or edit'
        ]
      },
      {
        stepNumber: 8,
        title: 'Move to Litters',
        content: 'Now let\'s explore the Litters feature. Click the "Litters" button in the header to navigate to the litter management section.',
        highlightElement: '[data-tutorial-target="litters-btn"]',
        actionType: 'click',
        tips: [
          'Litters are where you track breeding',
          'Where offspring are recorded',
          'Essential for breeding programs'
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
        title: 'Litter Management',
        content: 'You\'re now in the Litters section. This is where you track breeding litters and manage offspring. Click the "New Litter" button to create a new litter.',
        highlightElement: '[data-tutorial-target="new-litter-btn"]',
        actionType: 'click',
        tips: [
          'Litters organize offspring by breeding',
          'Each litter has parents and offspring',
          'Optional but helpful for breeders'
        ]
      },
      {
        stepNumber: 2,
        title: 'Sire & Dam Selection',
        content: 'Select both a Sire (father) and Dam (mother) for the litter. Note: Intersex and Unknown gender animals can be selected on both Sire and Dam selectors, allowing inclusive representation of non-binary animals.',
        highlightElement: '[data-tutorial-target="sire-dam-section"]',
        tips: [
          'Both parents are mandatory',
          'Can use same species animals',
          'Inclusive gender selection available'
        ]
      },
      {
        stepNumber: 3,
        title: 'Birth Date & Offspring Count',
        content: 'Enter the birth date of the litter (optional but recommended for direct offspring creation). Enter the number of males and females born. These fields help with administrative tracking.',
        highlightElement: '[data-tutorial-target="litter-dates-counts"]',
        tips: [
          'Birth date needed to create offspring directly',
          'Male/female counts are optional',
          'Used for statistics'
        ]
      },
      {
        stepNumber: 4,
        title: 'Link Existing Animals',
        content: 'After creating the litter with parents and a birth date, you can link existing animals as offspring. Click "Link Animals" to connect animals that are offspring from this specific litter.',
        highlightElement: '[data-tutorial-target="link-animals-btn"]',
        hideHighlightPrompt: true,
        tips: [
          'Birth date is required before linking',
          'Only animals matching parents and date appear',
          'Updates their parent information',
          'Completes the family tree'
        ]
      },
      {
        stepNumber: 5,
        title: 'Create New Offspring Animals',
        content: 'In the "New Offspring Animals" section (separate from the male/female count fields), you can directly create new offspring animals. With a birth date filled in, click "Create Offspring" to add new animals and automatically set them as children of this litter with the sire and dam already assigned.',
        highlightElement: '[data-tutorial-target="create-offspring-btn"]',
        hideHighlightPrompt: true,
        tips: [
          'Different from male/female count fields',
          'Found in "New Offspring Animals" section',
          'Creates animals with parent links pre-filled',
          'Requires birth date to use'
        ]
      },
      {
        stepNumber: 6,
        title: 'Litter Card Details',
        content: 'Once you\'ve created a litter, click on a litter card to view its details. Here you can see the parents, offspring, and manage the litter from an expanded view.',
        highlightElement: '[data-tutorial-target="litter-card"]',
        tips: [
          'Requires a litter to be created first',
          'Shows complete litter information',
          'Edit, link, or add offspring from here',
          'View parentage clearly'
        ]
      },
      {
        stepNumber: 7,
        title: 'Litter Actions',
        content: 'On the expanded litter view, you\'ll see buttons to: Edit the litter, Link animals to it, Add new offspring, and Delete the litter. These give you full control over litter management.',
        highlightElement: '[data-tutorial-target="litter-actions"]',
        hideHighlightPrompt: true,
        tips: [
          'Edit changes parent or dates',
          'Link connects existing animals',
          'Add offspring creates new animals',
          'Delete removes litter (careful!)'
        ]
      },
      {
        stepNumber: 8,
        title: 'Move to Profile',
        content: 'Let\'s now explore your profile settings. Click the "Profile" button in the header.',
        highlightElement: '[data-tutorial-target="profile-btn"]',
        actionType: 'click',
        tips: [
          'Profile shows your public identity',
          'Settings affect sharing and visibility',
          'Where others find you'
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
        title: 'Profile Summary',
        content: 'Your profile page shows a summary of your settings and information. You can see your Personal ID here - this is a unique identifier in CritterTrack. Your Personal ID is used by other users to find and contact you.',
        highlightElement: '[data-tutorial-target="personal-id-section"]',
        tips: [
          'Personal ID is unique to you',
          'Shown to other users',
          'Used for sharing and transfers',
          'Share this ID to receive notifications'
        ]
      },
      {
        stepNumber: 2,
        title: 'Edit Profile Button',
        content: 'Click "Edit Profile" to modify your profile information including name, image, and public settings.',
        highlightElement: '[data-tutorial-target="profile-edit-btn"]',
        tips: [
          'Opens edit mode for profile',
          'Can change all public info',
          'Changes save immediately'
        ]
      },
      {
        stepNumber: 3,
        title: 'Profile Image',
        content: 'Upload a profile picture. This image represents you to other users. Click the image area to upload.',
        highlightElement: '[data-tutorial-target="profile-image-upload"]',
        tips: [
          'Shows to other users',
          'Professional photo recommended',
          'Optional but recommended'
        ]
      },
      {
        stepNumber: 4,
        title: 'Personal Name & Breeder Name',
        content: 'Enter your Personal Name (your real name) and Breeder Name (your breeder affixes/kennel name). These are separate so you can maintain privacy if desired. Each has a visibility toggle.',
        highlightElement: '[data-tutorial-target="name-fields"]',
        tips: [
          'Personal Name: Your real identity',
          'Breeder Name: Your breeding prefix/affixes',
          'Both can be private or public'
        ]
      },
      {
        stepNumber: 5,
        title: 'Website & Country',
        content: 'Add your website (if you have a breeding website), select your country, and write a bio. The bio helps tell other breeders about yourself and your breeding program. These help other users find and learn about you.',
        highlightElement: '[data-tutorial-target="website-country-fields"]',
        tips: [
          'Website links to your info',
          'Country helps with shipping/contact',
          'Optional information'
        ]
      },
      {
        stepNumber: 6,
        title: 'Public Profile Visibility',
        content: 'These checkboxes control what information is visible on your public profile. Check which aspects you want to share: Personal Name, Breeder Name, website, etc. If private, only you see that info.',
        highlightElement: '[data-tutorial-target="public-visibility-checkboxes"]',
        hideHighlightPrompt: true,
        tips: [
          'Strategic visibility increases interest',
          'Can be very selective',
          'You always see everything'
        ]
      },
      {
        stepNumber: 7,
        title: 'Messaging Preferences',
        content: 'Configure how other users can contact you. You can allow messages, emails, or both. This controls your preferred method of communication.',
        highlightElement: '[data-tutorial-target="messaging-preferences"]',
        tips: [
          'Controls how users reach you',
          'Choose your preferred method',
          'Can change anytime'
        ]
      },
      {
        stepNumber: 8,
        title: 'Email Notifications',
        content: 'Set up email notifications for important events like messages, transfer requests, or system updates. Choose which notifications you want to receive.',
        highlightElement: '[data-tutorial-target="email-notifications"]',
        tips: [
          'Stay informed about important events',
          'Customizable preferences',
          'Helpful for active breeders'
        ]
      },
      {
        stepNumber: 9,
        title: 'Breeding Status',
        content: 'Set your breeding status for each species you work with. Choose Owner (not breeding), Active Breeder, or Retired Breeder. Active and Retired breeders are visible in the public Breeders Directory.',
        highlightElement: '[data-tutorial-target="breeding-status-section"]',
        tips: [
          'Owner: You have animals but don\'t breed',
          'Active Breeder: Currently breeding this species',
          'Retired Breeder: No longer actively breeding',
          'Active/Retired breeders appear in directory'
        ]
      },
      {
        stepNumber: 10,
        title: 'Save or Cancel',
        content: 'Use the Save button to keep your changes or Cancel to discard them. Changes are applied immediately upon save.',
        highlightElement: '[data-tutorial-target="profile-save-cancel"]',
        tips: [
          'Save makes changes permanent',
          'Cancel discards edits',
          'Return to summary after save'
        ]
      },
      {
        stepNumber: 11,
        title: 'Move to Budget',
        content: 'Now let\'s explore the Budget section to understand financial tracking. Click the "Budget" button in the header.',
        highlightElement: '[data-tutorial-target="budget-btn"]',
        actionType: 'click',
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
        highlightElement: '[data-tutorial-target="budget-overview"]',
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
        highlightElement: '[data-tutorial-target="add-transaction-btn"]',
        actionType: 'click',
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
        highlightElement: '[data-tutorial-target="expense-form"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="animal-sale-manual"]',
        hideHighlightPrompt: true,
        actionType: 'click',
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
        highlightElement: '[data-tutorial-target="manual-sale-form"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="animal-sale-transfer"]',
        hideHighlightPrompt: true,
        tips: [
          'Transfer creates relationships',
          'Both users stay connected',
          'Recommended for CritterTrack users'
        ]
      },
      {
        stepNumber: 8,
        title: 'Transfer Ownership Features',
        content: 'Transfer Ownership initiates an animal transfer between CritterTrack users. The key features are: The animal gets a "Sold" status in your collection, you retain a view-only copy of the animal\'s record, the new owner gains full editing rights, and you can see all future changes they make. Neither party can delete the animal.',
        highlightElement: '[data-tutorial-target="transfer-ownership-form"]',
        hideHighlightPrompt: true,
        tips: [
          'Maintains breeding history',
          'Both parties keep records',
          'Prevents accidental deletion',
          'Shows lineage transparency'
        ]
      },
      {
        stepNumber: 9,
        title: 'Close & Reopen - Animal Purchase',
        content: 'Now let\'s look at purchases. Close this, reopen Add Transaction, and select "Animal Purchase". Since manual entry is the same as sales, we\'ll focus on the "Notify Seller" option.',
        highlightElement: '[data-tutorial-target="animal-purchase-notify"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="notify-seller-form"]',
        hideHighlightPrompt: true,
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
        title: 'Global Search in Header',
        content: 'The Search button in the header is your global search tool. It allows you to search across all users and animals on CritterTrack by name or ID. This finds animals from the entire community, not just your collection.',
        highlightElement: '[data-tutorial-target="global-search-btn"]',
        tips: [
          'Search the entire CritterTrack community',
          'Find users and their animals',
          'Search by name or ID only',
          'Opens a dedicated search modal'
        ]
      },
      {
        stepNumber: 2,
        title: 'My Animals Search Bar',
        content: 'In your "My Animals" section, you\'ll find a separate search bar that lets you search within your own collection by animal name. This is local to your animals only.',
        highlightElement: '[data-tutorial-target="my-animals-search"]',
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
        content: 'In your "My Animals" section, use the Species dropdown to filter your collection by animal type. Combine this with the search bar for quick access to specific animals.',
        highlightElement: '[data-tutorial-target="species-filter"]',
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
        highlightElement: '[data-tutorial-target="gender-filter"]',
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
        highlightElement: '[data-tutorial-target="status-filter"]',
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
        highlightElement: '[data-tutorial-target="my-animals-section"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="notification-bell"]',
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
        highlightElement: '[data-tutorial-target="transfer-notifications"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="system-notifications"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="messages-btn"]',
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
        highlightElement: '[data-tutorial-target="messaging-section"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="profile-message-btn"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="message-conversations"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="messaging-privacy"]',
        hideHighlightPrompt: true,
        tips: [
          'Secure communication',
          'Respect privacy settings',
          'Both parties control messaging'
        ]
      },
      {
        stepNumber: 5,
        title: 'Next: Advanced Features Tour',
        content: 'Congratulations on completing the Key Features tour! You now understand how to view and edit animals, manage litters, configure your profile, handle breeding finances, search and filter, receive notifications, and communicate with other breeders. Would you like to start the "Advanced Features" tour? This will teach you about tags, genetics, COI calculations, and more advanced community features.',
        actionType: 'startNextTour',
        actionData: { nextTour: 'advanced' },
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
        highlightElement: '[data-tutorial-target="tags-explanation"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="add-tags-field"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="tag-filter"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="bulk-privacy-controls"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="bulk-delete-btn"]',
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
        content: 'Your public profile is how other breeders find and learn about you. It shows your information, animals (if public), and enables connections.',
        highlightElement: '[data-tutorial-target="public-profile-section"]',
        hideHighlightPrompt: true,
        tips: [
          'Professional identity',
          'Shows your breeding program',
          'Attracts other breeders'
        ]
      },
      {
        stepNumber: 2,
        title: 'Profile Visibility Control',
        content: 'Use visibility toggles to control what appears on your public profile. You can be selective about what you share while maintaining community connections.',
        highlightElement: '[data-tutorial-target="profile-visibility"]',
        hideHighlightPrompt: true,
        tips: [
          'Strategic sharing',
          'Balance openness and privacy',
          'Control your information'
        ]
      },
      {
        stepNumber: 3,
        title: 'Public Animal Profiles',
        content: 'When you make an animal public, other users can see its profile including lineage, genetics, breeding history, and availability.',
        highlightElement: '[data-tutorial-target="public-animal-profile"]',
        hideHighlightPrompt: true,
        tips: [
          'Market your breeding stock',
          'Show off prize animals',
          'Attract interested buyers'
        ]
      },
      {
        stepNumber: 4,
        title: 'Sharing Animals',
        content: 'First, open an existing animal from your collection to view its details. Then, click the "Share" button to copy the unique link to your clipboard. You can share this link with other breeders so they can view the full pedigree and contact you about the animal.',
        highlightElement: '[data-tutorial-target="share-animal-btn"]',
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
        highlightElement: '[data-tutorial-target="coi-explanation"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="why-coi-matters"]',
        hideHighlightPrompt: true,
        tips: [
          'Genetics matter',
          'Track genetic relationships',
          'Use COI in breeding decisions'
        ]
      },
      {
        stepNumber: 3,
        title: 'Viewing COI',
        content: 'When viewing an animal, look for the COI percentage. It\'s usually shown on the animal card or in the details. It reflects that animal\'s genetic diversity.',
        highlightElement: '[data-tutorial-target="coi-display"]',
        hideHighlightPrompt: true,
        tips: [
          'Check before breeding',
          'Use in breeding decisions',
          'Important pedigree metric'
        ]
      },
      {
        stepNumber: 4,
        title: 'Predicted COI for Pairings',
        content: 'When selecting potential breeding pairs, the system can predict the COI of offspring. This helps you understand the genetic relationship before making breeding decisions.',
        highlightElement: '[data-tutorial-target="predicted-coi"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="ethical-breeding"]',
        hideHighlightPrompt: true,
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
        highlightElement: '[data-tutorial-target="marketplace-btn"]',
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
    title: '5. Breeder Directory',
    description: 'Discover and connect with breeders around the world',
    tour: 'advanced-features',
    tourOrder: 5,
    steps: [
      {
        stepNumber: 1,
        title: 'Breeder Directory Overview',
        content: 'The Breeder Directory helps you find active breeders of specific species. Click the star/moon icon in the header to access it. Breeders can mark themselves as "Active Breeder" or "Retired Breeder" for each species in their settings.',
        highlightElement: '[data-tutorial-target="breeders-btn"]',
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
        highlightElement: '[data-tutorial-target="animal-tree-btn"]',
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
        highlightElement: '[data-tutorial-target="genetics-btn"]',
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
        highlightElement: '[data-tutorial-target="select-animal-btn"]',
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
        highlightElement: '[data-tutorial-target="parent-selectors"]',
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
        highlightElement: '[data-tutorial-target="calculate-offspring-btn"]',
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
        highlightElement: '[data-tutorial-target="offspring-results"]',
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
        content: 'Congratulations! You\'ve completed all CritterTrack tutorials. You now know how to manage your entire breeding program - from adding animals to tracking genetics and finances. You can always revisit these tutorials from the Help section in the header. Thank you for taking the time to learn all that CritterTrack has to offer!',
        highlightElement: '[data-tutorial-target="help-btn"]',
        tips: [
          'Access tutorials anytime from Help',
          'All features are at your fingertips',
          'Happy breeding!'
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
