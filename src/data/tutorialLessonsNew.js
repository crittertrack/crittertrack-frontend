// Tutorial lessons content is being reworked — emptied out until the tutorials are rebuilt.
const GETTING_STARTED_LESSONS = [];
const KEY_FEATURES_LESSONS = [];
const ADVANCED_FEATURES_LESSONS = [];

const ALL_LESSONS_ARRAY = [
  ...GETTING_STARTED_LESSONS,
  ...KEY_FEATURES_LESSONS,
  ...ADVANCED_FEATURES_LESSONS
];

// Export in the format expected by app.jsx
export const TUTORIAL_LESSONS = {
  onboarding: GETTING_STARTED_LESSONS,
  features: KEY_FEATURES_LESSONS,
  advanced: ADVANCED_FEATURES_LESSONS,
  all: ALL_LESSONS_ARRAY
};

// Also export as default for compatibility
export default TUTORIAL_LESSONS;
