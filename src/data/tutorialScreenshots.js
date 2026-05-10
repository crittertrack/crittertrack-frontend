// Tutorial Screenshots Mapping
// Screenshots can be added here as they become available
// Format: { "lesson-id": { "step1": "/images/tutorials/tour/filename.png" } }

const TUTORIAL_SCREENSHOTS = {
  "getting-started": {
    "gs-add-animal": {
      "step1": "/images/tutorials/getting-started/add-animal-button.png"
    },
    "gs-select-species": {
      "step1": "/images/tutorials/getting-started/welcome-to-species-selection.png",
      "step2": "/images/tutorials/getting-started/default-species.png",
      "step3": "/images/tutorials/getting-started/species-search-bar.png",
      "step4": "/images/tutorials/getting-started/favorite-species-star-icons.png",
      "step5": "/images/tutorials/getting-started/category-icons-on-species-cards.png",
      "step6": "/images/tutorials/getting-started/add-new-species-button.png",
      "step7": "/images/tutorials/getting-started/species-name.png",
      "step8": "/images/tutorials/getting-started/category-selection.png",
      "step9": "/images/tutorials/getting-started/latin-scientific-name.png",
      "step10": "/images/tutorials/getting-started/return-to-species-selector.png",
      "step11": "/images/tutorials/getting-started/select-fancy-mouse.png"
    },
    "gs-animal-overview": {
      "step1": "/images/tutorials/getting-started/welcome-to-animal-overview.png",
      "step2": "/images/tutorials/getting-started/animal-image.png",
      "step3": "/images/tutorials/getting-started/name-with-prefix-suffix.png",
      "step4": "/images/tutorials/getting-started/gender-selection.png",
      "step5": "/images/tutorials/getting-started/date-of-birth.png",
      "step6": "/images/tutorials/getting-started/status-selection.png",
      "step7": "/images/tutorials/getting-started/save-vs-continue.png"
    },
    "gs-status-privacy": {
      "step1": "/images/tutorials/getting-started/welcome-to-ownership.png",
      "step2": "/images/tutorials/getting-started/breeder-assignment.png",
      "step3": "/images/tutorials/getting-started/keeper-section.png",
      "step4": "/images/tutorials/getting-started/keeper-history.png",
      "step5": "/images/tutorials/getting-started/availability-for-sale-or-stud.png"
    },
    "gs-identification": {
      "step1": "/images/tutorials/getting-started/identification-tab.png",
      "step2": "/images/tutorials/getting-started/identification-breeder-id.png",
      "step3": "/images/tutorials/getting-started/microchip-number.png",
      "step4": "/images/tutorials/getting-started/pedigree-registration-id.png",
      "step5": "/images/tutorials/getting-started/classification-section.png",
      "step6": "/images/tutorials/getting-started/breed-selection.png",
      "step7": "/images/tutorials/getting-started/strain.png",
      "step8": "/images/tutorials/getting-started/origin.png",
      "step9": "/images/tutorials/getting-started/tags-feature.png"
    },
    "gs-physical": {
      "step1": "/images/tutorials/getting-started/appearance-tab.png",
      "step2": "/images/tutorials/getting-started/template-based-physical-fields.png",
      "step3": "/images/tutorials/getting-started/carrier-traits.png",
      "step4": "/images/tutorials/getting-started/genetic-code.png",
      "step5": "/images/tutorials/getting-started/genetic-builder-overview.png",
      "step6": "/images/tutorials/getting-started/close-genetic-builder.png",
      "step7": "/images/tutorials/getting-started/life-stage.png",
      "step8": "/images/tutorials/getting-started/measurements-and-growth-tracking.png",
      "step9": "/images/tutorials/getting-started/measurement-units.png",
      "step10": "/images/tutorials/getting-started/add-first-measurement.png",
      "step11": "/images/tutorials/getting-started/add-second-measurement.png.png",
      "step12": "/images/tutorials/getting-started/view-growth-chart.png"
    },
    "gs-lineage": {
      "step1": "/images/tutorials/getting-started/pedigree-tab.png",
      "step2": "/images/tutorials/getting-started/assign-sire-father.png",
      "step3": "/images/tutorials/getting-started/parent-search-system.png",
      "step4": "/images/tutorials/getting-started/close-sire-selector.png"
    },
    "gs-family-tab": {
      "step1": "/images/tutorials/getting-started/open-family-tab.png",
      "step2": "/images/tutorials/getting-started/parents-and-siblings.png",
      "step3": "/images/tutorials/getting-started/litters-and-offspring.png"
    },
    "gs-breeding": {
      "step1": "/images/tutorials/getting-started/fertility-tab.png",
      "step2": "/images/tutorials/getting-started/reproductive-status.png",
      "step3": "/images/tutorials/getting-started/estrus-and-cycle-information.png",
      "step4": "/images/tutorials/getting-started/sire-information.png",
      "step5": "/images/tutorials/getting-started/dam-information.png"
    },
    "gs-health": {
      "step1": "/images/tutorials/getting-started/health-tab.png",
      "step2": "/images/tutorials/getting-started/preventive-care.png",
      "step3": "/images/tutorials/getting-started/procedures-and-diagnostics.png",
      "step4": "/images/tutorials/getting-started/active-medical-records.png",
      "step5": "/images/tutorials/getting-started/health-clearances-and-screening.png",
      "step6": "/images/tutorials/getting-started/veterinary-care.png"
    },
    "gs-husbandry": {
      "step1": "/images/tutorials/getting-started/care-tab.png",
      "step2": "/images/tutorials/getting-started/feeding-schedule.png",
      "step3": "/images/tutorials/getting-started/housing-and-enclosure.png",
      "step4": "/images/tutorials/getting-started/animal-care.png",
      "step5": "/images/tutorials/getting-started/environment.png",
      "step6": "/images/tutorials/getting-started/grooming.png"
    },
    "gs-behavior": {
      "step1": "/images/tutorials/getting-started/behavior-tab.png",
      "step2": "/images/tutorials/getting-started/behavior-items.png",
      "step3": "/images/tutorials/getting-started/activity.png",
      "step4": "/images/tutorials/getting-started/known-issues.png"
    },
    "gs-records-eol": {
      "step1": "/images/tutorials/getting-started/notes-and-milestones-tab.png",
      "step2": "/images/tutorials/getting-started/notes.png",
      "step3": "/images/tutorials/getting-started/milestones.png"
    },
    "gs-show": {
      "step1": "/images/tutorials/getting-started/show-tab.png",
      "step2": "/images/tutorials/getting-started/show-titles-and-ratings.png",
      "step3": "/images/tutorials/getting-started/judge-comments.png"
    },
    "gs-legal": {
      "step1": "/images/tutorials/getting-started/legal-tab.png",
      "step2": "/images/tutorials/getting-started/licensing-and-permits.png",
      "step3": "/images/tutorials/getting-started/legal-administrative.png",
      "step4": "/images/tutorials/getting-started/restrictions.png",
      "step5": "/images/tutorials/getting-started/end-of-life-tab.png",
      "step6": "/images/tutorials/getting-started/date-of-death.png",
      "step7": "/images/tutorials/getting-started/cause-of-death.png",
      "step8": "/images/tutorials/getting-started/necropsy-results.png"
    }
  },
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
