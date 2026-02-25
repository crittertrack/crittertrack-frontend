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
