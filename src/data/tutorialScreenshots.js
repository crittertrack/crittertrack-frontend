// Tutorial Screenshots Mapping
// Screenshots can be added here as they become available
// Format: { "lesson-id": { "step1": "/images/tutorials/tour/filename.png" } }

const TUTORIAL_SCREENSHOTS = {
  "getting-started": {},
  "key-features": {},
  "advanced-features": {}
};

/**
 * Get screenshot URL for a lesson step
 * @param {string} lessonId - Tutorial lesson ID
 * @param {number} stepNumber - Step number
 * @returns {string|null} Screenshot URL or null if not found
 */
function getStepScreenshot(lessonId, stepNumber) {
  const stepKey = `step${stepNumber}`;
  for (const [tourName, lessons] of Object.entries(TUTORIAL_SCREENSHOTS)) {
    if (lessons[lessonId] && lessons[lessonId][stepKey]) {
      return lessons[lessonId][stepKey];
    }
  }
  return null;
}

export { TUTORIAL_SCREENSHOTS, getStepScreenshot };
export default { TUTORIAL_SCREENSHOTS, getStepScreenshot };
