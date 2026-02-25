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
    4: 'add-new-species-button.png', // Step 4: Add New Species Button
    5: 'species-name.png', // Step 5: Species Name
    6: 'category-selection.png', // Step 6: Category Selection
    7: 'latinscientific-name.png', // Step 7: Latin/Scientific Name
    8: 'return-to-species-selector.png', // Step 8: Return to Species Selector
    9: 'select-fancy-mouse.png', // Step 9: Select Fancy Mouse
  },
  
  'gs-animal-overview': {
    1: 'welcome-to-animal-overview.png', // Step 1: Welcome to Animal Overview
    2: 'animal-image.png', // Step 2: Animal Image
    3: 'name-with-prefixsuffix.png', // Step 3: Name with Prefix/Suffix
    4: 'gender-selection.png', // Step 4: Gender Selection
    5: 'date-of-birth.png', // Step 5: Date of Birth
    6: 'status-selection.png', // Step 6: Status Selection
    7: 'save-vs-continue.png', // Step 7: Save vs Continue
  },
  
  'gs-status-privacy': {
    1: 'welcome-to-status-and-privacy.png', // Step 1: Welcome to Status & Privacy
    2: 'breeder-assignment.png', // Step 2: Breeder Assignment
    3: 'current-owner-section.png', // Step 3: Current Owner Section
    4: 'availability-for-sale-or-stud.png', // Step 4: Availability for Sale or Stud
    5: 'move-to-physical-tab.png', // Step 5: Move to Physical Tab
  },
  
  'gs-physical': {
    1: 'physical-characteristics.png', // Step 1: Physical Characteristics
    2: 'template-based-physical-fields.png', // Step 2: Template-Based Physical Fields
    3: 'filling-out-physical-fields.png', // Step 3: Filling Out Physical Fields
    4: 'additional-physical-notes..png', // Step 4: Additional Physical Notes
    5: 'genetic-code-the-add-button.png', // Step 5: Genetic Code - The ADD Button
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
    8: 'tags-feature.png', // Step 8: Tags Feature
  },
  
  'gs-lineage': {
    1: 'lineage-tab.png', // Step 1: Lineage Tab
    2: 'select-sire-father.png', // Step 2: Select Sire (Father)
    3: 'parent-search-system.png', // Step 3: Parent Search System
    4: 'close-sire-selector.png', // Step 4: Close Sire Selector
    5: 'other-parent-selector.png', // Step 5: Other Parent Selector
    6: 'origin-information.png', // Step 6: Origin Information
    7: 'ownership-history.png', // Step 7: Ownership History
  },
  
  'gs-breeding': {
    1: 'breeding-tab.png', // Step 1: Breeding Tab
    2: 'reproductive-status.png', // Step 2: Reproductive Status
    3: 'estrus-and-cycle-information.png', // Step 3: Estrus & Cycle Information
    4: 'mating-and-pregnancy.png', // Step 4: Mating & Pregnancy
    5: 'stud-information.png', // Step 5: Stud Information
    6: 'dam-information.png', // Step 6: Dam Information
    7: 'breeding-history.png', // Step 7: Breeding History
  },
  
  'gs-health': {
    1: 'health-tab.png', // Step 1: Health Tab
    2: 'preventive-care.png', // Step 2: Preventive Care
    3: 'procedures-and-diagnostics.png', // Step 3: Procedures & Diagnostics
    4: 'active-medical-records.png', // Step 4: Active Medical Records
    5: 'veterinary-care.png', // Step 5: Veterinary Care
  },
  
  'gs-husbandry': {
    1: 'animal-care-tab.png', // Step 1: Animal Care Tab
    2: 'feeding-schedule.png', // Step 2: Feeding Schedule
    3: 'housing-and-enclosure.png', // Step 3: Housing & Enclosure
    4: 'animal-care.png', // Step 4: Animal Care
    5: 'environment.png', // Step 5: Environment
    6: 'exercise-and-grooming.png', // Step 6: Exercise & Grooming
  },
  
  'create-animals': {
    // Screenshots to be added
  },
  
  // Key Features Lessons
  'kf-profile-settings': {
    // Screenshots to be added
  },
  
  // Advanced Features Lessons
  // Add mappings as screenshots become available
};

/**
 * Get screenshot URL for a specific lesson step
 * @param {string} lessonId - The lesson ID
 * @param {number} stepNumber - The step number (1-based)
 * @returns {string|null} - The screenshot URL or null if not available
 */
export const getStepScreenshot = (lessonId, stepNumber) => {
  const lessonScreenshots = TUTORIAL_SCREENSHOTS[lessonId];
  if (!lessonScreenshots || !lessonScreenshots[stepNumber]) {
    return null;
  }
  return `/images/tutorials/${lessonScreenshots[stepNumber]}`;
};
