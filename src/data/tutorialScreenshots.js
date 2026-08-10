// Tutorial Screenshots Mapping
// Keyed by tour/section id (matches a folder under public/images/tutorials/),
// then lesson id, then "step{N}" -> image path.
// Format: { "<sectionId>": { "<lessonId>": { "step1": "/images/tutorials/<sectionId>/<filename>.png" } } }
// Section ids (and their folders) come from TUTORIAL_SECTIONS in tutorialLessonsNew.js:
// getting-started, animal-record-tour, animal-list-tour, settings-tour, litter-management-tour, more-pages-tour
//
// NOTE: public/images/tutorials/getting-started/ still holds ~70 screenshots from the
// old (pre-rework) lesson set (ids like gs-add-animal, gs-select-species, etc.), none of
// which match current lesson ids below. They're kept on disk in case they're reusable for
// the new getting-started-animals / animal-record-tour lessons, but aren't wired up here yet.

const TUTORIAL_SCREENSHOTS = {
  "getting-started": {},
  "animal-record-tour": {},
  "animal-list-tour": {},
  "settings-tour": {},
  "litter-management-tour": {},
  "more-pages-tour": {}
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
