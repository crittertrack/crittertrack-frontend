# Report Page Implementation - TODO

## Steps

### Step 1: Backend - Update BugReport model to support images
- [x] Add `images` array field to BugReportSchema in `crittertrack-pedigree/database/models.js`

### Step 2: Backend - Update bugReportRoutes to accept images
- [x] Modify POST route to accept optional `images` array

### Step 3: Frontend - Create ReportPage.jsx component
- [x] Full page with form, image upload, previews, submission

### Step 4: Frontend - Add route to AppRoutes.jsx
- [x] Lazy-loaded route at `/report`

### Step 5: Frontend - Update app.jsx
- [x] Add "Report an Issue" to profile dropdown (desktop & mobile)
- [x] Update floating Beta Feedback button to link to report page

