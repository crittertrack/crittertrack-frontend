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
    // Screenshots to be added
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
