// Tutorial Screenshots Mapping
// Keyed by tour/section id (matches a folder under public/images/tutorials/),
// then lesson id, then "step{N}" -> image path.
// Format: { "<sectionId>": { "<lessonId>": { "step1": "/images/tutorials/<sectionId>/<filename>.png" } } }
// Section ids (and their folders) come from TUTORIAL_SECTIONS in tutorialLessonsNew.js:
// getting-started, animal-record-tour, animal-list-tour, settings-tour, litter-management-tour, more-pages-tour
//
// Only needed here as an override — screenshots saved with the filename TutorialsPage
// suggests (kebab-case of the step title, in the matching tour folder) are found
// automatically by getStepScreenshot() without adding an entry below.

const TUTORIAL_SCREENSHOTS = {
  "getting-started": {},
  "animal-record-tour": {},
  "animal-list-tour": {},
  "settings-tour": {
    // Steps 2 and 3 reuse step 1's screenshot — same screen, no new shot needed.
    "settings-directory": {
      step2: "/images/tutorials/settings-tour/species-and-breeding-status.png",
      step3: "/images/tutorials/settings-tour/species-and-breeding-status.png",
    },
  },
  "litter-management-tour": {},
  "more-pages-tour": {}
};

// Convert a step title to the kebab-case filename convention used across public/images/tutorials/.
function titleToFilename(title) {
  return title
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get screenshot URL for a lesson step.
 * Checks the manual override map first, then falls back to the naming convention
 * (/images/tutorials/{sectionId}/{titleToFilename(stepTitle)}.png) — the <img>'s onError
 * handler in TutorialsPage takes care of showing the placeholder if that file doesn't exist.
 * A step with multiple screenshots (see `screenshotCount` in tutorialLessonsNew.js) passes
 * `variant` 2, 3, etc., which resolves to a "-2"/"-3" suffixed filename/override key.
 * @param {string} sectionId - Tour/section id (matches a folder under public/images/tutorials/)
 * @param {string} lessonId - Tutorial lesson ID
 * @param {number} stepNumber - Step number
 * @param {string} stepTitle - Step title, used for the convention-based filename fallback
 * @param {number} [variant=1] - Which screenshot for this step, for steps with more than one
 * @returns {string|null} Screenshot URL or null if it can't be determined
 */
function getStepScreenshot(sectionId, lessonId, stepNumber, stepTitle, variant = 1) {
  const stepKey = variant > 1 ? `step${stepNumber}_${variant}` : `step${stepNumber}`;
  const override = TUTORIAL_SCREENSHOTS[sectionId]?.[lessonId]?.[stepKey];
  if (override) return override;
  if (!sectionId || !stepTitle) return null;
  const suffix = variant > 1 ? `-${variant}` : '';
  return `/images/tutorials/${sectionId}/${titleToFilename(stepTitle)}${suffix}.png`;
}

export { TUTORIAL_SCREENSHOTS, getStepScreenshot, titleToFilename };
export default { TUTORIAL_SCREENSHOTS, getStepScreenshot, titleToFilename };

