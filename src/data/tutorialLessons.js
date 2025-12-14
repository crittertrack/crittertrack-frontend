/**
 * Tutorial Lessons for CritterTrack
 * 
 * These lessons are organized into:
 * 1. "onboarding" - The initial tutorial for new users
 * 2. "features" - Advanced features shown in the Info tab
 */

export const TUTORIAL_LESSONS = {
  // ====================================
  // ONBOARDING TUTORIALS (shown to new users)
  // ====================================
  onboarding: [
    {
      id: 'welcome',
      title: 'Welcome to CritterTrack! 👋',
      description: 'CritterTrack is your personal breeding database and genetics tracker. This quick tutorial will get you started with the essential features.',
      category: 'getting-started',
      steps: [
        {
          stepNumber: 1,
          title: 'Welcome to CritterTrack',
          content: 'Track your breeding colony with ease. From animals to genetics to finances - it\'s all here.',
          tips: [
            'CritterTrack helps you manage your animals\' genetics and breeding records',
            'All your data is stored securely',
            'You can make your animals public to share with other breeders'
          ]
        }
      ]
    },
    {
      id: 'create-animals',
      title: '1. Creating Your First Animals 🐭',
      description: 'Learn how to add animals to your collection.',
      category: 'core-features',
      steps: [
        {
          stepNumber: 1,
          title: 'Start Adding Animals',
          content: 'Click the "+ Add Animal" button in the My Animals section to create a new animal.',
          highlightElement: '[data-tutorial-target="add-animal-btn"]',
          tips: [
            'Every animal needs a name and species',
            'You can add photos for easier identification',
            'Required fields are marked with a *'
          ]
        },
        {
          stepNumber: 2,
          title: 'Select a Species',
          content: 'Choose a species from the available options. If your species isn\'t listed, you can add a custom species by selecting "add new species" (bottom right, highlight) where you can create a new species.',
          highlightElement: '[data-tutorial-target="add-new-species-btn"]',
          tips: [
            'Common species like Fancy Mouse, Fancy Rat and Various Hamsters are pre-loaded'
          ]
        },
        {
          stepNumber: 3,
          title: 'Fill in Basic Information',
          content: 'Enter your animal\'s name, gender, and birthdate.',
          tips: [
            'The name should be unique for easy identification',
            'Select the correct gender for genetics tracking',
            'Birthdate helps track age and breeding timeline'
          ]
        },
        {
          stepNumber: 4,
          title: 'Add Animal Details',
          content: 'You can optionally add color, coat type, genetic code, and other details. Upload a photo so you can easily find your animal later!',
          tips: [
            'Photos help identify animals at a glance',
            'Color and coat information is useful for genetics',
            'You can edit these details later'
          ]
        },
        {
          stepNumber: 5,
          title: 'Save Your Animal',
          content: 'Click "Save Animal" to add it to your collection. Your animal will be assigned a unique CritterTrack ID.',
          tips: [
            'Your animal is now in your collection',
            'You can edit or delete it anytime',
            'Share it publicly to show other breeders'
          ]
        }
      ]
    },
    {
      id: 'assign-parents',
      title: '2. Assigning Parents 👨‍👩‍👧',
      description: 'Build your pedigree by assigning parents to animals.',
      category: 'core-features',
      steps: [
        {
          stepNumber: 1,
          title: 'Edit Your Animal',
          content: 'Go back to the My Animals section and click on the animal you just created. Then click the Edit button in the top right corner.',
          highlightElement: '[data-tutorial-target="edit-animal-btn"]',
          tips: [
            'Click on an animal card to view its details',
            'The Edit button is in the top right corner',
            'You can edit any animal anytime'
          ]
        },
        {
          stepNumber: 2,
          title: 'Assign a Sire (Father)',
          content: 'In the "Pedigree: Sire and Dam 🌳" section, click on the Sire field to select the father. You can search your own animals or the global database. The global database shows all animals marked as public by other breeders. Note: other breeders can reject the use of their animals in your pedigree.',
          highlightElement: '[data-tutorial-target="pedigree-section"]',
          tips: [
            'The sire must be male',
            'Global search shows animals marked public by other users',
            'Breeders can reject use of their animals in your pedigree',
            'Search by name or CritterTrack ID'
          ]
        },
        {
          stepNumber: 3,
          title: 'Assign a Dam (Mother)',
          content: 'Use the Dam field to select a female parent. Similar to the sire, you can search your own animals or the global database. The global database shows all animals marked as public by other breeders. Other breeders can reject the use of their animals in your pedigree.',
          highlightElement: '[data-tutorial-target="pedigree-section"]',
          tips: [
            'The dam must be female',
            'Global search shows animals marked public by other users',
            'Breeders can reject use of their animals in your pedigree',
            'Parents must be alive before the offspring\'s birth date'
          ]
        },
        {
          stepNumber: 4,
          title: 'Complete the Family Tree',
          content: 'Continue this process for all your animals. The deeper your pedigrees, the more valuable your genetic data!',
          tips: [
            'Even incomplete pedigrees are helpful',
            'You can add parents later',
            'Share public animals to help other breeders'
          ]
        }
      ]
    },
    {
      id: 'create-litters',
      title: '3. Creating Litters 🍼',
      description: 'Group related offspring together by creating litters.',
      category: 'core-features',
      steps: [
        {
          stepNumber: 1,
          title: 'Access the Litters Tab',
          content: 'Click on the Litters button in the header to manage your litters.',
          highlightElement: '[data-tutorial-target="litters-btn"]',
          tips: [
            'Litters contain COI (Coefficient of Inbreeding)',
            'Link animals to see siblings',
            'Track male/female counts'
          ]
        },
        {
          stepNumber: 2,
          title: 'Create a New Litter',
          content: 'Click the "New Litter" button to start creating a new litter. You\'ll select the sire (father) and dam (mother).',
          highlightElement: '[data-tutorial-target="new-litter-btn"]',
          tips: [
            'Both parents are required',
            'Parents must be the same species',
            'You can optionally set pairing and birth dates'
          ]
        },
        {
          stepNumber: 3,
          title: 'Select Parents & Birth Date',
          content: 'Select both the Sire (Father) and Dam (Mother) - this is required. The parents\' species determines the offspring species. You can optionally set the Number of Males and Females fields. Once you\'ve set the parents and birth date, offspring sections will appear below where you can link existing animals or create new ones.',
          highlightElement: '[data-tutorial-target="litter-sire-dam"]',
          tips: [
            'Parents must be the same species - offspring will inherit this species',
            'Birth Date is required to create new offspring in this form',
            'Number of Males/Females are optional fields for tracking purposes',
            'Once birth date is set, the offspring sections will appear'
          ]
        },
        {
          stepNumber: 4,
          title: 'Link Animals to the Litter',
          content: 'Link existing animals as offspring or create new offspring directly. The "Link Existing Animals" section shows animals matching these parents. The "Create New Offspring" section lets you quickly add new animals to this litter.',
          highlightElement: '[data-tutorial-target="litter-offspring-sections"]',
          tips: [
            'CritterTrack auto-finds animals with matching parents',
            'You can link existing animals to the litter',
            'Track how many males and females were born',
            'Create new offspring directly with parents and species pre-filled'
          ]
        },
        {
          stepNumber: 5,
          title: 'Litter Information',
          content: 'Each litter shows the COI, number of offspring, and breeding pair info. Use this to track your breeding program!',
          tips: [
            'Lower COI is generally better for health',
            'Keep detailed notes about the litter',
            'Review litters to plan future breedings'
          ]
        }
      ]
    },
    {
      id: 'profile-settings',
      title: '4. Profile Settings ⚙️',
      description: 'Customize your profile and privacy settings.',
      category: 'core-features',
      steps: [
        {
          stepNumber: 1,
          title: 'Access Your Profile',
          content: 'Click on the Profile button in the header to access your profile settings.',
          highlightElement: '[data-tutorial-target="profile-btn"]',
          tips: [
            'Your profile is visible to other breeders',
            'You can customize what information is public',
            'Add a profile photo for recognition'
          ]
        },
        {
          stepNumber: 2,
          title: 'Edit Your Profile',
          content: 'Click the "Edit Profile" button to customize your personal information, breeder name, and privacy settings.',
          highlightElement: '[data-tutorial-target="profile-edit-btn"]',
          tips: [
            'Your breeder name helps other breeders find you',
            'You can hide your personal name for privacy',
            'Update your profile photo'
          ]
        },
        {
          stepNumber: 3,
          title: 'Privacy Settings',
          content: 'Control what information is visible to others: email, website, genetic codes, and remarks.',
          tips: [
            'Default: only your breeder name is public',
            'You control every piece of information',
            'Change settings anytime'
          ]
        }
      ]
    },
    {
      id: 'budget-basics',
      title: '5. Budget Tracking 💰',
      description: 'Track your breeding expenses, income, and animal transactions.',
      category: 'core-features',
      steps: [
        {
          stepNumber: 1,
          title: 'Why Track a Budget?',
          content: 'The Budget tab helps you manage expenses (food, housing, medical), income (stud fees, donations), and animal transactions (sales & purchases). Click the Budget button in the header to get started.',
          highlightElement: '[data-tutorial-target="budget-btn"]',
          tips: [
            'See the true cost of your breeding program',
            'Track animal sales and purchases separately',
            'Plan for future expenses',
            'Calculate net profit/loss'
          ]
        },
        {
          stepNumber: 2,
          title: 'Understanding Transaction Types',
          content: 'When you click "Add Transaction", you\'ll choose from 4 types: Animal Sale (selling an animal), Animal Purchase (buying an animal), Expense (general costs), or Income (other income like stud fees).',
          highlightElement: '[data-tutorial-target="add-transaction-btn"]',
          tips: [
            'Animal Sale: Records selling YOUR animal to someone else',
            'Animal Purchase: Records buying an animal from someone else',
            'Expense: Food, housing, medical, equipment, etc.',
            'Income: Stud fees, donations, or other income'
          ]
        },
        {
          stepNumber: 3,
          title: 'Animal Transactions: Manual vs Transfer',
          content: 'For Animal Sales and Purchases, you\'ll choose a mode: Manual Entry (just record the transaction) or Transfer/Notify (actually transfer ownership and/or notify the other user).',
          tips: [
            'Manual: Quick record-keeping, no ownership change',
            'Transfer/Notify: Real ownership transfer + notification system',
            'Transfer mode requires selecting a CritterTrack user',
            'The other user must accept the transfer'
          ]
        },
        {
          stepNumber: 4,
          title: 'Sale Workflow',
          content: 'When selling an animal in Transfer mode: You select your animal → Choose the buyer (CritterTrack user) → Buyer receives notification → Buyer accepts → Ownership transfers to buyer, and you keep view-only access to track lineage. Quick tip: You can also click the "Transfer" button on any animal\'s detail page to start a sale with that animal pre-selected!',
          tips: [
            'Shortcut: Use the "Transfer" button on animal detail cards',
            'Seller keeps view-only access after sale (can\'t edit)',
            'Buyer owns the animal but CANNOT delete it (can only Return)',
            'Transaction is recorded in both users\' budgets',
            'Sold animals are protected from being sold again'
          ]
        },
        {
          stepNumber: 5,
          title: 'Purchase Workflow',
          content: 'When recording a purchase in Transfer mode: You select your animal (that you bought) → Choose the seller/breeder → Seller receives view-only offer → Seller accepts → You keep ownership, seller gets view-only access.',
          tips: [
            'You must already own the animal you\'re recording',
            'Original breeder gets view-only access to track their lines',
            'Transaction shows as expense (reduces net profit)',
            'Seller can see pedigree but cannot edit'
          ]
        },
        {
          stepNumber: 6,
          title: 'Expenses & Income',
          content: 'For general Expenses and Income, just fill in description, price, and date. No transfer system needed - these are simple records for tracking costs and other income sources.',
          tips: [
            'Be specific with descriptions (e.g., "50lb bag feed" vs "food")',
            'Dates help identify spending patterns',
            'Regular expenses: food, bedding, vet visits, equipment',
            'Regular income: stud fees, rehoming fees, donations'
          ]
        },
        {
          stepNumber: 7,
          title: 'View Your Financial Summary',
          content: 'The Budget tab shows total sales, purchases, expenses, income, and net profit. Transactions are color-coded: Sales (green), Purchases (red), Expenses (orange), Income (blue).',
          tips: [
            'Net Profit = (Sales + Income) - (Purchases + Expenses)',
            'Filter by date range to see monthly/yearly trends',
            'Export data for tax records',
            'Track which animals are most profitable'
          ]
        },
        {
          stepNumber: 8,
          title: 'Tutorial Complete! 🎉',
          content: 'Congratulations! You\'ve completed the Getting Started tutorial and learned the core features of CritterTrack.',
          tips: [
            'You can always restart tutorials from the Help tab',
            'Access advanced feature tutorials anytime',
            'Explore all features at your own pace'
          ]
        }
      ]
    }
  ],

  // ====================================
  // ADVANCED FEATURES (shown in Info tab)
  // ====================================
  features: [
    {
      id: 'advanced-welcome',
      title: 'Welcome to Advanced Features! 🚀',
      description: 'Unlock the full power of CritterTrack with advanced tools and features.',
      category: 'welcome',
      steps: [
        {
          stepNumber: 1,
          title: 'Ready for Advanced Features?',
          content: 'You\'ve mastered the basics! Now explore advanced tools: genetics calculators for predicting offspring, COI analysis for breeding decisions, advanced transfers & purchases, powerful search & filtering, and more. Each tutorial builds on previous knowledge - skip what you know and revisit anytime from the Help tab.',
          tips: [
            'These features help serious breeders take their program to the next level',
            'Learn at your own pace - skip tutorials you already understand',
            'Access all tutorials anytime from the Help tab'
          ]
        }
      ]
    },
    {
      id: 'search-filter',
      title: 'Searching & Filtering 🔍',
      description: 'Find your animals quickly using search and advanced filters.',
      category: 'navigation',
      steps: [
        {
          stepNumber: 1,
          title: 'Search Your Animals',
          content: 'Use the search bar in the My Animals section to quickly find your own animals by name.',
          highlightElement: '[data-tutorial-target="my-animals-search"]',
          tips: [
            'Search by partial name (e.g., "min" finds Minnie)',
            'Minimum 3 characters to search',
            'Only searches your owned animals'
          ]
        },
        {
          stepNumber: 2,
          title: 'Global User & Animal Search',
          content: 'Click the Search button in the top navigation to search across all public animals and find other breeders in the CritterTrack community.',
          highlightElement: '[data-tutorial-target="global-search-btn"]',
          tips: [
            'Search by animal ID format: CT123 or just 123',
            'Find other breeders by name or ID',
            'View public profiles and animals'
          ]
        },
        {
          stepNumber: 3,
          title: 'Filter by Species',
          content: 'Use the species dropdown to show only animals of a specific type (Mice, Rats, Hamsters, etc.).',
          highlightElement: '[data-tutorial-target="species-filter"]',
          tips: [
            'Helpful for multi-species breeders',
            'See how many animals per species',
            'Combine with other filters'
          ]
        },
        {
          stepNumber: 4,
          title: 'Filter by Gender',
          content: 'Use the gender buttons to show only males or females. Click the Mars (♂) icon for males and Venus (♀) icon for females.',
          highlightElement: '[data-tutorial-target="gender-filter"]',
          tips: [
            'Quick way to count breeding stock',
            'Plan gender-specific sales',
            'Balance your collection'
          ]
        },
        {
          stepNumber: 5,
          title: 'Filter by Status',
          content: 'Filter by status: Breeder, Pet, Sold, Retired, Deceased, etc. to organize your collection.',
          highlightElement: '[data-tutorial-target="status-filter"]',
          tips: [
            'Track which animals are actively breeding',
            'See sold or rehomed animals',
            'Keep records organized'
          ]
        },
        {
          stepNumber: 6,
          title: 'Collection & Breeding Filters',
          content: 'Use the "Show" filters to toggle between My Animals/All Animals, and filter by breeding status: Mating, Pregnant, or Nursing.',
          highlightElement: '[data-tutorial-target="collection-filters"]',
          tips: [
            'My Animals shows only your owned animals',
            'All Animals includes view-only animals',
            'Breeding filters help track active pairs and expecting mothers'
          ]
        },
        {
          stepNumber: 7,
          title: 'Visibility Filters',
          content: 'Filter animals by their visibility status: All, Public (visible to everyone), or Private (only you can see).',
          highlightElement: '[data-tutorial-target="visibility-filter"]',
          tips: [
            'Quickly see which animals are public',
            'Manage your privacy settings',
            'Private animals won\'t appear in global search'
          ]
        }
      ]
    },
    {
      id: 'genetics-calculator',
      title: 'Genetics Calculator 🧬',
      description: 'Calculate genetic outcomes for mouse breeding pairs.',
      category: 'advanced',
      steps: [
        {
          stepNumber: 1,
          title: 'What is the Genetics Calculator?',
          content: 'Predict offspring phenotypes (appearance) based on parental genetics. Currently optimized for mice.',
          tips: [
            'Works best with known genetic codes',
            'Shows probability of each phenotype',
            'Helps plan for desired traits'
          ]
        },
        {
          stepNumber: 2,
          title: 'Enter Parent Genetics',
          content: 'Select or enter the genetic codes for sire and dam. Use standard mouse genetics notation.',
          tips: [
            'Format: e.g., +/+ for wildtype, a/a for homozygous recessive',
            'Multiple genes can be entered',
            'See examples in the calculator'
          ]
        },
        {
          stepNumber: 3,
          title: 'View Predictions',
          content: 'The calculator shows all possible offspring combinations and their probabilities.',
          tips: [
            'Percentages add up to 100%',
            'Plan for recessive traits',
            'Understand genetic inheritance'
          ]
        },
        {
          stepNumber: 4,
          title: 'Save Your Genes',
          content: 'Save frequently-used genetic combinations for quick reference.',
          tips: [
            'Build a library of your lines',
            'Share with other breeders',
            'Reference for future breedings'
          ]
        }
      ]
    },
    {
      id: 'transfer-animals',
      title: 'Advanced Transfer Features 🚚',
      description: 'Learn advanced animal transfer features and best practices.',
      category: 'sharing',
      steps: [
        {
          stepNumber: 1,
          title: 'Quick Review: Transfer System',
          content: 'The Budget tab\'s Transfer/Notify system lets you sell animals with automatic ownership transfer and buyer notifications. This lesson covers advanced features and tips.',
          tips: [
            'Review: Use Budget tab → Add Transaction → Animal Sale → Transfer mode',
            'Quick shortcut: Click Transfer button on any animal card',
            'This lesson focuses on advanced features not covered in basics'
          ]
        },
        {
          stepNumber: 2,
          title: 'Managing View-Only Access',
          content: 'After selling an animal, you keep view-only access to track your breeding lines. You can\'t edit sold animals, but you can see their pedigree, offspring, and updates.',
          tips: [
            'View-only animals appear with an orange "Sold" badge',
            'Use filters to show/hide sold animals from your main list',
            'Buyers can\'t delete animals - they can only Return them',
            'Great for tracking your breeding program\'s success'
          ]
        },
        {
          stepNumber: 3,
          title: 'Purchase Workflow: Offering View-Only',
          content: 'When you buy an animal and record it as a Purchase in Transfer mode, the original breeder/seller receives a view-only offer. They can accept to track their bloodlines.',
          tips: [
            'Helps breeders track where their genetics go',
            'Original owner sees animal in their collection (view-only)',
            'Builds community and breeder relationships',
            'Useful for tracking genetic diversity across programs'
          ]
        },
        {
          stepNumber: 4,
          title: 'Returning Animals',
          content: 'Buyers can return animals to the original owner using the Delete/Return button. This removes their ownership and notifies the seller, automatically removing view-only access.',
          tips: [
            'Returns are permanent - can\'t be undone',
            'Seller gets notification of the return',
            'Transaction stays in budget history for records',
            'Use notes field to explain return reason'
          ]
        },
        {
          stepNumber: 5,
          title: 'Tutorial Complete! 🎉',
          content: 'You\'ve learned the advanced transfer features! Check the box below to mark this tutorial as complete.',
          isCompletionStep: true,
          tips: [
            'Practice transfers with other users to master the system',
            'Check notifications regularly for transfer requests',
            'Use Budget tab to track all your transactions',
            'Explore other advanced tutorials in the Info tab'
          ]
        }
      ]
    },
    {
      id: 'pedigree-charts',
      title: 'Pedigree Charts 📋',
      description: 'Visualize and export family trees for your animals.',
      category: 'documentation',
      steps: [
        {
          stepNumber: 1,
          title: 'View Pedigree Chart',
          content: 'Click "View Pedigree" on any animal to see its family tree spanning 4 generations.',
          tips: [
            'Shows all ancestors back to great-grandparents',
            'Visual layout for easy understanding',
            'Click ancestors to see their details'
          ]
        },
        {
          stepNumber: 2,
          title: 'Pedigree Information',
          content: 'Each animal card shows name, color, coat, gender, ID, and breeder information.',
          tips: [
            'Color indicators: blue=male, pink=female',
            'See breeder information',
            'Track line contributions'
          ]
        },
        {
          stepNumber: 3,
          title: 'COI Calculation',
          content: 'The pedigree includes COI (Coefficient of Inbreeding) for tracking genetic diversity.',
          tips: [
            'Lower COI = more genetic diversity',
            'Helps prevent genetic problems',
            'Compare different breeding pairs'
          ]
        },
        {
          stepNumber: 4,
          title: 'Export as PDF',
          content: 'Download your pedigree chart as a high-quality PDF for printing or sharing.',
          tips: [
            'Professional format for records',
            'Share with buyers',
            'Keep printed backups'
          ]
        }
      ]
    },
    {
      id: 'public-profiles',
      title: 'Public Profiles & Sharing 🌐',
      description: 'Share your breeding program with the CritterTrack community.',
      category: 'sharing',
      steps: [
        {
          stepNumber: 1,
          title: 'What are Public Profiles?',
          content: 'Make your animals visible to other breeders to showcase your breeding program.',
          tips: [
            'Help other breeders find genes',
            'Build your reputation',
            'Connect with the community'
          ]
        },
        {
          stepNumber: 2,
          title: 'Make Animals Public',
          content: 'Toggle "Public" on individual animals to display them on your profile.',
          tips: [
            'Only marked animals are visible',
            'You control what\'s shared',
            'Change anytime'
          ]
        },
        {
          stepNumber: 3,
          title: 'Your Breeder Profile',
          content: 'Other breeders can find your profile and see all your public animals, organized by species.',
          tips: [
            'Profile includes your breeder name and contact',
            'Shows all public animals',
            'Share your URL with other breeders'
          ]
        },
        {
          stepNumber: 4,
          title: 'Global Search',
          content: 'Use Global Search to find other breeders and their animals. View pedigrees of public animals.',
          tips: [
            'Find specific traits or genetics',
            'Connect with other breeders',
            'Expand your gene pool responsibly'
          ]
        }
      ]
    },
    {
      id: 'coi-explained',
      title: 'Understanding COI (Coefficient of Inbreeding) 📊',
      description: 'Learn about genetic diversity and inbreeding calculations.',
      category: 'genetics',
      steps: [
        {
          stepNumber: 1,
          title: 'What is COI?',
          content: 'COI measures genetic relatedness. Higher COI means less genetic diversity and higher risk of genetic problems.',
          tips: [
            'Calculated from pedigree depth',
            'Expressed as a percentage',
            'Lower is better (aim for < 10%)'
          ]
        },
        {
          stepNumber: 2,
          title: 'How is COI Calculated?',
          content: 'CritterTrack calculates COI based on common ancestors in the pedigree. More distant ancestors = lower COI.',
          tips: [
            'Requires at least a few generations',
            'Deep pedigrees are more accurate',
            'Assumes accurate data'
          ]
        },
        {
          stepNumber: 3,
          title: 'Interpreting COI Results',
          content: 'COI < 5% = Low (excellent), 5-10% = Moderate (acceptable), > 10% = High (concerning)',
          tips: [
            'Plan breedings to minimize COI',
            'Track COI trends over generations',
            'Use genetic diversity wisely'
          ]
        },
        {
          stepNumber: 4,
          title: 'Using COI to Plan Breedings',
          content: 'Check COI before deciding on a breeding pair. Avoid high-COI pairings that could cause health problems.',
          tips: [
            'Use COI as one factor in breeding decisions',
            'Document your reasoning',
            'Share with community for feedback'
          ]
        }
      ]
    },
    {
      id: 'advanced-features-complete',
      title: 'Advanced Features Complete! 🎉',
      description: 'Congratulations on mastering all advanced CritterTrack features!',
      category: 'completion',
      steps: [
        {
          stepNumber: 1,
          title: 'You\'re a CritterTrack Expert!',
          content: 'Congratulations! You\'ve completed all Advanced Features tutorials and mastered the full power of CritterTrack. Check the box below to mark your achievement.',
          isCompletionStep: true,
          tips: [
            'You\'ve mastered all major CritterTrack features!',
            'Revisit any tutorial anytime from the Help tab',
            'Share your knowledge with the breeder community',
            'Keep breeding responsibly and ethically!'
          ]
        }
      ]
    }
  ]
};

/**
 * Get a specific lesson by ID
 */
export const getLessonById = (lessonId) => {
  const allLessons = [...TUTORIAL_LESSONS.onboarding, ...TUTORIAL_LESSONS.features];
  return allLessons.find(lesson => lesson.id === lessonId);
};

/**
 * Get all onboarding lessons
 */
export const getOnboardingLessons = () => TUTORIAL_LESSONS.onboarding;

/**
 * Get all feature lessons
 */
export const getFeatureLessons = () => TUTORIAL_LESSONS.features;

/**
 * Get all lessons by category
 */
export const getLessonsByCategory = (category) => {
  const allLessons = [...TUTORIAL_LESSONS.onboarding, ...TUTORIAL_LESSONS.features];
  return allLessons.filter(lesson => lesson.category === category);
};

/**
 * Check if all lessons in a tutorial type are completed
 */
export const areAllLessonsCompleted = (lessons, completedTutorials) => {
  if (!lessons || lessons.length === 0) return false;
  return lessons.every(lesson => completedTutorials.includes(lesson.id));
};

/**
 * Check if the budget-basics tutorial is complete
 */
export const isOnboardingComplete = (completedTutorials) => {
  return completedTutorials.includes('budget-basics'); // Last onboarding tutorial
};

/**
 * Check if user has started advanced features
 */
export const hasStartedAdvancedFeatures = (completedTutorials) => {
  const advancedLessonIds = TUTORIAL_LESSONS.features.map(l => l.id);
  return advancedLessonIds.some(id => completedTutorials.includes(id));
};

/**
 * Check if all advanced features tutorials are complete
 */
export const areAdvancedFeaturesComplete = (completedTutorials) => {
  return completedTutorials.includes('advanced-features-complete'); // Final completion lesson
};
