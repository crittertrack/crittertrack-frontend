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
          title: 'Fill in Basic Information',
          content: 'Enter your animal\'s name, species, gender, and birthdate.',
          tips: [
            'The name should be unique for easy identification',
            'Select the correct gender for genetics tracking',
            'Birthdate helps track age and breeding timeline'
          ]
        },
        {
          stepNumber: 3,
          title: 'Add Animal Details',
          content: 'You can optionally add color, coat type, genetic code, and other details. Upload a photo so you can easily find your animal later!',
          tips: [
            'Photos help identify animals at a glance',
            'Color and coat information is useful for genetics',
            'You can edit these details later'
          ]
        },
        {
          stepNumber: 4,
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
          title: 'Why Assign Parents?',
          content: 'Assigning parents creates a family tree and enables genetic calculations like Coefficient of Inbreeding (COI).',
          tips: [
            'COI helps prevent genetic problems',
            'You can see entire family lines',
            'Track lineage across generations'
          ]
        },
        {
          stepNumber: 2,
          title: 'Assign a Sire (Father)',
          content: 'When creating or editing an animal, use the "Sire" field to select a male parent. You can search by name or ID.',
          tips: [
            'The sire must be male',
            'Search your own animals or global database',
            'You can search by name or CritterTrack ID'
          ]
        },
        {
          stepNumber: 3,
          title: 'Assign a Dam (Mother)',
          content: 'Use the "Dam" field to select a female parent. Similar to the sire, you can search your own animals or the global database.',
          tips: [
            'The dam must be female',
            'Both parents should be the same species',
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
          title: 'What is a Litter?',
          content: 'A litter is a record of offspring born from a specific breeding pair. It helps track which animals are siblings.',
          tips: [
            'Litters contain COI (Coefficient of Inbreeding)',
            'Link animals to see siblings',
            'Track male/female counts'
          ]
        },
        {
          stepNumber: 2,
          title: 'Create a New Litter',
          content: 'Go to the Litters tab and click "New Litter". Select the sire and dam.',
          highlightElement: '[data-tutorial-target="litter-management-tab"]',
          tips: [
            'Both parents are required',
            'Parents must be the same species',
            'You can optionally set pairing and birth dates'
          ]
        },
        {
          stepNumber: 3,
          title: 'Link Animals to the Litter',
          content: 'Add animals to the litter by creating new ones or linking existing animals with matching parents and birthdate.',
          tips: [
            'CritterTrack can auto-find matching animals',
            'You can manually add new animals',
            'Track how many males and females were born'
          ]
        },
        {
          stepNumber: 4,
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
          content: 'Click on your profile icon in the top-right corner to access profile settings.',
          highlightElement: '[data-tutorial-target="profile-menu"]',
          tips: [
            'Your profile is visible to other breeders',
            'You can customize what information is public',
            'Add a profile photo for recognition'
          ]
        },
        {
          stepNumber: 2,
          title: 'Personal Information',
          content: 'Add your personal name and breeder name. Choose whether to display them publicly.',
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
        },
        {
          stepNumber: 4,
          title: 'Display Animals',
          content: 'Choose which animals appear on your public profile. Mark animals as "public" in their settings.',
          tips: [
            'Only marked animals show on your profile',
            'Share your best animals with the community',
            'Showcase your breeding program'
          ]
        }
      ]
    },
    {
      id: 'budget-basics',
      title: '5. Budget Tracking 💰',
      description: 'Track your breeding expenses and income.',
      category: 'core-features',
      steps: [
        {
          stepNumber: 1,
          title: 'Why Track a Budget?',
          content: 'The Budget tab helps you manage expenses (food, housing, medical) and income (animal sales).',
          tips: [
            'See the true cost of your breeding program',
            'Plan for future expenses',
            'Track profitability'
          ]
        },
        {
          stepNumber: 2,
          title: 'Add Expenses',
          content: 'Go to the Budget tab and add expenses for feed, housing, medical care, equipment, etc.',
          highlightElement: '[data-tutorial-target="budget-tab"]',
          tips: [
            'Be specific about expense types',
            'Include all costs (setup, recurring, etc.)',
            'Dates help track spending patterns'
          ]
        },
        {
          stepNumber: 3,
          title: 'Track Income',
          content: 'Record income from animal sales. Link sales to specific animals or buyers.',
          tips: [
            'Track which animals generate income',
            'Identify your most profitable animals',
            'Calculate ROI for each breeding'
          ]
        },
        {
          stepNumber: 4,
          title: 'View Reports',
          content: 'See breakdowns of expenses by category and compare income vs. expenses over time.',
          tips: [
            'Monthly and yearly overviews',
            'Export data for records',
            'Plan your breeding budget'
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
      id: 'search-filter',
      title: 'Searching & Filtering 🔍',
      description: 'Find your animals quickly using search and advanced filters.',
      category: 'navigation',
      steps: [
        {
          stepNumber: 1,
          title: 'Quick Search',
          content: 'Use the search bar to find animals by name or CritterTrack ID. Works across your own animals and the global database.',
          tips: [
            'Search by partial name (e.g., "min" finds Minnie)',
            'Search by ID format: CT123 or just 123',
            'Results include both local and global animals'
          ]
        },
        {
          stepNumber: 2,
          title: 'Filter by Species',
          content: 'Filter your collection by species type (Mice, Rats, Hamsters, etc.).',
          tips: [
            'Helpful for multi-species breeders',
            'See how many animals per species',
            'Filter in multiple locations'
          ]
        },
        {
          stepNumber: 3,
          title: 'Filter by Gender',
          content: 'Show only males or females to plan breeding pairs or sales.',
          tips: [
            'Quick way to count breeding stock',
            'Plan gender-specific sales',
            'Balance your collection'
          ]
        },
        {
          stepNumber: 4,
          title: 'Filter by Status',
          content: 'Filter by status: Breeder, Pet, Sold, Retired, Deceased, etc.',
          tips: [
            'Track which animals are actively breeding',
            'See sold or rehomed animals',
            'Keep records organized'
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
      title: 'Transferring Animals 🚚',
      description: 'Transfer ownership of animals to other breeders.',
      category: 'sharing',
      steps: [
        {
          stepNumber: 1,
          title: 'Why Transfer Animals?',
          content: 'Mark animals as sold or rehomed, and update ownership records.',
          tips: [
            'Keep accurate records of your breeding program',
            'Track where animals went',
            'Maintain contact with new owners'
          ]
        },
        {
          stepNumber: 2,
          title: 'Mark as Sold',
          content: 'In animal details, you can track sale price and buyer information.',
          tips: [
            'Record sale price for budget tracking',
            'Add buyer contact information',
            'Keep records for breeding follow-up'
          ]
        },
        {
          stepNumber: 3,
          title: 'Update Status',
          content: 'Change the animal\'s status from "Breeder" to "Sold", "Rehomed", or other status.',
          tips: [
            'Helps track current breeding stock',
            'Maintain complete colony history',
            'See statistics on your breeding success'
          ]
        },
        {
          stepNumber: 4,
          title: 'Share Pedigree Info',
          content: 'Consider sharing pedigree information with the new owner for their records.',
          tips: [
            'Export pedigree charts as PDF',
            'Help new owners understand genetics',
            'Build breeder community'
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
