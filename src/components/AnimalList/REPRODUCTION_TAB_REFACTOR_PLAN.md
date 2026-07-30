# Reproduction Tab Refactor Plan

This document outlines the plan to refactor and enhance the "Reproduction" tab within the CritterTrack application.

## Phase 1: Update Enclosures Section (Completed)

The first phase focuses on improving the clarity and consistency of the enclosures section at the top of the tab.

-   **Objective:** Display only enclosures relevant to reproduction.
-   **Action:**
    -   ✅ Filtered the enclosures list to show only those with a `purpose` of `'reproduction'`.
    -   ✅ Replaced the current custom list style with the standardized `EnclosureCard` component.
    -   ✅ Ensured the "Add" button functionality is consistent, using the main `EnclosureModal`.

## Phase 2: Redesign Animal Display

The second phase involves a complete redesign of how reproductive animals are displayed to make the information more scannable and actionable.

-   **Objective:** Replace the current animal cards with a more informative horizontal bar layout.
-   **Action:**
    -   ✅ Created a new `ReproductiveAnimalBar` component.
    -   ✅ Each bar now displays the following information in columns:
        1.  **Animal Details:** Image, Prefix/Name/Suffix.
        2.  **Mating Date:** (Placeholder)
        3.  **Due Date / Birthdate:** (Placeholder)
        4.  **Weaning Date:** (Placeholder)
        5.  **Status:** A visual pill indicating the animal's current reproductive state.
        6.  **Actions:** A button to advance the animal's state.

## Data Fetching Strategy

Displaying the key reproductive dates (Mating, Due, Weaning) requires data that is not currently fetched by the `AnimalList` component. The implementation will proceed in two steps:

1.  ✅ **Layout First:** Built the new `ReproductiveAnimalBar` component with placeholder data for the date fields.
2.  **Data Integration:** Modify the data fetching logic to include associated `Litter` or `BreedingRecord` information and populate the date fields with live data.