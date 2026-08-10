# Tutorial Screenshots

This folder contains screenshots for the Tutorials/Lessons page.

## Folder Structure

One subfolder per tour (matches `TUTORIAL_SECTIONS` in `src/data/tutorialLessonsNew.js`):
- `getting-started/`
- `animal-record-tour/`
- `animal-list-tour/`
- `settings-tour/`
- `litter-management-tour/`
- `more-pages-tour/`

## Adding a Screenshot

1. Open the lesson/step on the Tutorials page — if no screenshot is set yet, the
   placeholder shows the exact suggested path (tour folder + filename) to save it as.
2. Take a clear screenshot, crop to highlight the relevant UI, and save it under the
   matching tour folder using that suggested filename (any descriptive name works).
3. Add its path to `TUTORIAL_SCREENSHOTS` in `src/data/tutorialScreenshots.js`, under
   that tour → lesson id → `stepN`:
   ```js
   "getting-started": {
     "getting-started-animals": {
       "step1": "/images/tutorials/getting-started/add-animal-button.png"
     }
   }
   ```
4. The screenshot will automatically appear on that lesson step.

## Legacy Screenshots

`getting-started/` still holds ~70 screenshots from before the tutorial content was
reworked (old ids like `gs-add-animal`, `gs-select-species`, etc.). They're not wired
up to any current lesson yet, but are kept in case they're reusable.

