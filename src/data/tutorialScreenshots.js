/**
 * Tutorial Screenshots Mapping
 * Maps lesson IDs and step numbers to screenshot filenames
 * Screenshots should be placed in /public/images/tutorials/
 */

export const TUTORIAL_SCREENSHOTS = {
  // Getting Started Lessons
  'gs-add-animal': {
    1: 'add-animal-button.png', // Step 1: Add Animal Button
  },
  
  'gs-select-species': {
    1: 'welcome-to-species-selection.png', // Step 1: Welcome to Species Selection
    2: 'default-species.png', // Step 2: Default Species
    3: 'species-search-bar.png', // Step 3: Species Search Bar
    4: 'favorite-species-star-icons.png', // Step 4: Favorite Species (Star Icons)
    5: 'category-icons-on-species-cards.png', // Step 5: Category Icons on Species Cards
    6: 'add-new-species-button.png', // Step 6: Add New Species Button
    7: 'species-name.png', // Step 7: Species Name
    8: 'category-selection.png', // Step 8: Category Selection
    9: 'latin-scientific-name.png', // Step 9: Latin/Scientific Name
    10: 'return-to-species-selector.png', // Step 10: Return to Species Selector
    11: 'select-fancy-mouse.png', // Step 11: Select Fancy Mouse
  },
  
  'gs-animal-overview': {
    1: 'welcome-to-animal-overview.png', // Step 1: Welcome to Animal Overview
    2: 'animal-image.png', // Step 2: Animal Image
    3: 'name-with-prefix-suffix.png', // Step 3: Name with Prefix/Suffix
    4: 'gender-selection.png', // Step 4: Gender Selection
    5: 'date-of-birth.png', // Step 5: Date of Birth
    6: 'status-selection.png', // Step 6: Status Selection
    7: 'save-vs-continue.png', // Step 7: Save vs Continue
  },
  
  'gs-status-privacy': {
    1: 'welcome-to-ownership.png', // Step 1: Welcome to Ownership
    2: 'breeder-assignment.png', // Step 2: Breeder Assignment
    3: 'keeper-section.png', // Step 3: Keeper Section
    4: 'keeper-history.png', // Step 4: Keeper History
    5: 'availability-for-sale-or-stud.png', // Step 5: Availability for Sale or Stud
  },
  
  'gs-physical': {
    1: 'physical-characteristics.png', // Step 1: Physical Characteristics
    2: 'template-based-physical-fields.png', // Step 2: Template-Based Physical Fields
    3: 'filling-out-physical-fields.png', // Step 3: Filling Out Physical Fields
    4: 'carrier-traits.png', // Step 4: Carrier Traits
    5: 'genetic-code-the-add-button.png', // Step 5: Genetic Code
    6: 'genetic-builder-overview.png', // Step 6: Genetic Builder Overview
    7: 'close-genetic-builder.png', // Step 7: Close Genetic Builder
    8: 'life-stage.png', // Step 8: Life Stage
    9: 'measurements-and-growth-tracking.png', // Step 9: Measurements & Growth Tracking
    10: 'measurement-units.png', // Step 10: Measurement Units
    11: 'add-first-measurement.png', // Step 11: Add First Measurement
    12: 'add-second-measurement.png', // Step 12: Add Second Measurement
    13: 'view-growth-chart.png', // Step 13: View Growth Chart
  },
  
  'gs-identification': {
    1: 'identification-tab.png', // Step 1: Identification Tab
    2: 'identification-breeder-id.png', // Step 2: Identification (Breeder ID)
    3: 'microchip-number.png', // Step 3: Microchip Number
    4: 'pedigree-registration-id.png', // Step 4: Pedigree Registration ID
    5: 'classification-section.png', // Step 5: Classification Section
    6: 'breed-selection.png', // Step 6: Breed Selection
    7: 'strain.png', // Step 7: Strain
    8: 'origin-information.png', // Step 8: Origin
    9: 'tags-feature.png', // Step 9: Tags Feature
  },
  
  'gs-lineage': {
    1: 'lineage-tab.png', // Step 1: Lineage Tab
    2: 'select-sire-father.png', // Step 2: Select Sire (Father)
    3: 'parent-search-system.png', // Step 3: Parent Search System
    4: 'close-sire-selector.png', // Step 4: Close Sire Selector
    5: 'other-parent-selector.png', // Step 5: Other Parent Selector
  },
  
  'gs-breeding': {
    1: 'breeding-tab.png', // Step 1: Breeding Tab
    2: 'reproductive-status.png', // Step 2: Reproductive Status
    3: 'estrus-and-cycle-information.png', // Step 3: Estrus & Cycle Information
    4: 'stud-information.png', // Step 4: Stud Information
    5: 'dam-information.png', // Step 5: Dam Information
  },
  
  'gs-health': {
    1: 'health-tab.png', // Step 1: Health Tab
    2: 'preventive-care.png', // Step 2: Preventive Care
    3: 'procedures-and-diagnostics.png', // Step 3: Procedures & Diagnostics
    4: 'active-medical-records.png', // Step 4: Active Medical Records
    5: 'health-clearances-and-screening.png', // Step 5: Health Clearances & Screening
    6: 'veterinary-care.png', // Step 6: Veterinary Care
  },
  
  'gs-husbandry': {
    1: 'animal-care-tab.png', // Step 1: Animal Care Tab
    2: 'feeding-schedule.png', // Step 2: Feeding Schedule
    3: 'housing-and-enclosure.png', // Step 3: Housing & Enclosure
    4: 'animal-care.png', // Step 4: Animal Care
    5: 'environment.png', // Step 5: Environment
    6: 'grooming.png', // Step 6: Grooming
  },
  
  'gs-behavior': {
    1: 'behavior-tab.png', // Step 1: Behavior Tab
    2: 'behavior-items.png', // Step 2: Behavior Items
    3: 'activity.png', // Step 3: Activity
    4: 'known-issues.png', // Step 4: Known Issues
  },
  
  'gs-records-eol': {
    1: 'notes-tab.png', // Step 1: Notes Tab
    2: 'remarks-and-notes.png', // Step 2: Remarks & Notes
  },
  
  'gs-show': {
    1: 'show-tab.png', // Step 1: Show Tab
    2: 'show-titles-and-ratings.png', // Step 2: Show Titles & Ratings
    3: 'judge-comments.png', // Step 3: Judge Comments
  },
  
  'gs-legal': {
    1: 'legal-tab.png', // Step 1: Legal Tab
    2: 'licensing-and-permits.png', // Step 2: Licensing & Permits
    3: 'legal-administrative.png', // Step 3: Legal / Administrative
    4: 'restrictions.png', // Step 4: Restrictions
    5: 'end-of-life-tab.png', // Step 5: End of Life Tab
    6: 'date-of-death.png', // Step 6: Date of Death
    7: 'cause-of-death.png', // Step 7: Cause of Death
    8: 'necropsy-results.png', // Step 8: Necropsy Results
  },
  
  'gs-show': {
    1: 'show-tab.png', // Step 1: Show Tab
    2: 'show-titles-and-ratings.png', // Step 2: Show Titles & Ratings
    3: 'judge-comments.png', // Step 3: Judge Comments
  },
  
  'gs-legal': {
    1: 'legal-tab.png', // Step 1: Legal Tab
    2: 'licensing-and-permits.png', // Step 2: Licensing & Permits
    3: 'legal-administrative.png', // Step 3: Legal / Administrative
    4: 'restrictions.png', // Step 4: Restrictions
  },
  
};

/**
 * Get screenshot URL for a specific lesson step
 * @param {string} lessonId - The lesson ID
 * @param {number} stepNumber - The step number (1-based)
 * @returns {string|null} - The screenshot URL or null if not available
 */
// Maps lesson ID prefix to subfolder
const LESSON_FOLDER = {
  'gs-': 'getting-started',
  'kf-': 'key-features',
  'af-': 'advanced-features',
};

export const getStepScreenshot = (lessonId, stepNumber) => {
  const lessonScreenshots = TUTORIAL_SCREENSHOTS[lessonId];
  if (!lessonScreenshots || !lessonScreenshots[stepNumber]) {
    return null;
  }
  const prefix = Object.keys(LESSON_FOLDER).find(p => lessonId.startsWith(p));
  const subfolder = prefix ? LESSON_FOLDER[prefix] : 'getting-started';
  return `/images/tutorials/${subfolder}/${lessonScreenshots[stepNumber]}`;
};
