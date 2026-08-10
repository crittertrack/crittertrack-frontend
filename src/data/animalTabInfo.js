// Per-tab InfoButton content shared by the animal edit form (AnimalFormModalV2) and the two
// read-only view modals (AnimalModalV2, ViewAnimalModalV2) — keeps their "?" hint text and
// linked tutorial lesson in sync instead of duplicating it three times.
export const ANIMAL_FORM_TAB_INFO = {
    dashboard: { title: 'Dashboard', lessonId: 'animal-tab-dashboard', body: 'Photos, identity, Breeder/Owner assignment, and Marketplace availability.' },
    identification: { title: 'Identification', lessonId: 'animal-tab-identification', body: 'ID numbers, classification, origin, and tags.' },
    appearance: { title: 'Appearance', lessonId: 'animal-tab-appearance', body: 'Descriptive traits, the visual Genetic Code Builder, Life Stage, and growth tracking.' },
    health: { title: 'Health', lessonId: 'animal-tab-health', body: 'Quarantine/treatment status, vaccinations, and medical history.' },
    care: { title: 'Routine Care', lessonId: 'animal-tab-care', body: 'Feeding, grooming, training, and enrichment schedules.' },
    behavior: { title: 'Behavior', lessonId: 'animal-tab-behavior', body: 'Temperament notes, socialization, and behavioral logs.' },
    breeding: { title: 'Breeding', lessonId: 'animal-tab-breeding', body: 'Breeding status, past pairings, and manual breeding history notes.' },
    pedigree: { title: 'Pedigree', lessonId: 'animal-tab-pedigree', body: 'Editing ancestry (Manual or Link CTC) three generations deep.' },
    gallery: { title: 'Gallery', lessonId: 'animal-tab-gallery', body: 'Additional photos beyond the main Dashboard image.' },
    timeline: { title: 'Timeline', lessonId: 'animal-tab-timeline', body: 'A chronological history of everything logged for this animal.' },
    records: { title: 'Records', lessonId: 'animal-tab-records', body: 'Seller/Buyer, price, legal/licensing info, and uploaded documents.' },
};

// The read-only view shares most tab content with the edit form, but Dashboard and Pedigree
// surface extra view-only-only features (Relationship Insights/Offspring/COI, and pedigree
// certificates) documented in their own dedicated lesson instead.
export const ANIMAL_VIEW_TAB_INFO = {
    ...ANIMAL_FORM_TAB_INFO,
    dashboard: { title: 'Dashboard', lessonId: 'animal-tab-view-only', body: 'Header badges/buttons, auto-built Relationship Insights, Offspring & Litters, and calculated COI.' },
    pedigree: { title: 'Pedigree', lessonId: 'animal-tab-view-only', body: 'The ancestor chart, plus printable/shareable Horizontal and Vertical pedigree certificates.' },
};
