# CritterTrack Tutorial System - Quick Reference

## TL;DR - 3 Step Integration

```jsx
// 1. Wrap your app
<TutorialProvider userId={userId}>
  <App />
</TutorialProvider>

// 2. Show on first login
const { hasSeenInitialTutorial, markInitialTutorialSeen } = useTutorial();
{!hasSeenInitialTutorial && <InitialTutorialModal />}

// 3. Add Info button to nav
<button onClick={() => setShowInfo(true)}>
  <BookOpen /> Info
</button>
```

---

## Files & Their Purpose

| File | Purpose | Size |
|------|---------|------|
| `tutorialLessons.js` | 11 lessons with 25+ steps | 12KB |
| `TutorialContext.jsx` | State + localStorage | 4KB |
| `TutorialOverlay.jsx` | Modal components | 8KB |
| `InfoTab.jsx` | Tutorial library view | 8KB |

---

## Hooks & Components

### useTutorial() Hook
```javascript
const {
  hasSeenInitialTutorial,       // Has user seen initial tutorial?
  completedTutorials,           // Array of completed lesson IDs
  currentTutorialId,            // Currently showing tutorial ID
  markInitialTutorialSeen,      // Mark as seen
  markTutorialCompleted,        // Mark lesson complete
  isTutorialCompleted,          // Check if lesson done
  resetAllTutorials,            // Reset all progress
  restartTutorial,              // Restart specific tutorial
  setCurrentTutorial,           // Show tutorial by ID
  clearCurrentTutorial,         // Hide tutorial
} = useTutorial();
```

### Components
- `<TutorialProvider userId={userId}>` - Wrapper (required)
- `<InitialTutorialModal onStart onSkip />` - Welcome screen
- `<TutorialOverlay lessonId onClose onComplete />` - Main modal
- `<InfoTab onClose />` - Full tutorial library
- `<TutorialHighlight elementSelector />` - Element highlight

---

## Lesson Structure

```javascript
{
  id: 'unique-id',
  title: 'Lesson Title',
  description: 'Short description',
  category: 'core-features',
  steps: [
    {
      stepNumber: 1,
      title: 'Step Title',
      content: 'Instructions and explanation',
      highlightElement: '[data-tutorial-target="btn-id"]', // optional
      tips: ['Tip 1', 'Tip 2']
    }
  ]
}
```

---

## Onboarding Lessons

1. **Welcome** - Intro to CritterTrack
2. **Creating Animals** - Add animals to collection
3. **Assigning Parents** - Build pedigrees
4. **Creating Litters** - Manage breeding records
5. **Profile Settings** - Customize privacy
6. **Budget Tracking** - Track expenses/income

---

## Advanced Features (in Info Tab)

1. **Searching & Filtering** - Find animals
2. **Genetics Calculator** - Predict offspring (mice)
3. **Transferring Animals** - Track sales
4. **Pedigree Charts** - Export family trees
5. **Public Profiles** - Share with community
6. **Understanding COI** - Genetic diversity

---

## Common Tasks

### Start Tutorial for User
```jsx
const { setCurrentTutorial } = useTutorial();
setCurrentTutorial('create-animals');
```

### Check if Tutorial Done
```jsx
const { isTutorialCompleted } = useTutorial();
if (isTutorialCompleted('create-animals')) {
  // Tutorial is complete
}
```

### Mark Tutorial Complete
```jsx
const { markTutorialCompleted } = useTutorial();
markTutorialCompleted('create-animals');
```

### Reset All Progress (Admin)
```jsx
const { resetAllTutorials } = useTutorial();
resetAllTutorials();
```

### Add Element Highlighting
```jsx
// In your HTML:
<button data-tutorial-target="add-animal-btn">Add Animal</button>

// In TutorialOverlay, step will have:
highlightElement: '[data-tutorial-target="add-animal-btn"]'
```

---

## Lesson IDs

**Onboarding:**
- `welcome`
- `create-animals`
- `assign-parents`
- `create-litters`
- `profile-settings`
- `budget-basics`

**Advanced:**
- `search-filter`
- `genetics-calculator`
- `transfer-animals`
- `pedigree-charts`
- `public-profiles`
- `coi-explained`

---

## localStorage Keys

Per-user progress storage:
- `${userId}_crittertrack_has_seen_initial_tutorial`
- `${userId}_crittertrack_completed_tutorials`

User must be logged in (userId passed to TutorialProvider)

---

## Styling & Colors

Uses existing CritterTrack colors:
- `bg-primary` - Main buttons
- `bg-accent` - Complete/highlight
- `bg-gray-*` - Backgrounds
- Tailwind utility classes

---

## Mobile Responsive

- Full-width modals on mobile
- Stack buttons vertically
- Touch-friendly sizing
- Readable typography
- Optimized highlighting

---

## Keyboard Support

- Tab: Navigate buttons
- Enter: Select button
- Escape: Close (optional)
- Previous/Next: Navigate steps

---

## Common Errors

| Error | Fix |
|-------|-----|
| `useTutorial must be used within TutorialProvider` | Wrap app with TutorialProvider |
| localStorage not working | Check userId is provided to TutorialProvider |
| Tutorial not showing | Check hasSeenInitialTutorial state |
| Highlight not working | Add data-tutorial-target to element |
| Progress lost | Ensure localStorage is enabled |

---

## Performance

- ~50KB total bundle
- Minimal re-renders
- Lazy loads lesson content
- localStorage for persistence
- No external dependencies (beyond React)

---

## Add New Lesson

1. Edit `tutorialLessons.js`
2. Add to `TUTORIAL_LESSONS.onboarding` or `.features`
3. Use existing lesson as template
4. Add steps with title, content, tips
5. Test with `setCurrentTutorial()`

---

## Edit Existing Lesson

1. Open `tutorialLessons.js`
2. Find lesson by ID
3. Update title, description, steps
4. Changes apply immediately

---

## Testing Checklist

- [ ] TutorialProvider wraps app
- [ ] userId is passed to provider
- [ ] Initial modal shows for new user
- [ ] Can start tutorial from welcome
- [ ] Can skip tutorial
- [ ] Can navigate between steps
- [ ] Progress saved to localStorage
- [ ] Info tab shows all lessons
- [ ] Can restart tutorials
- [ ] Element highlighting works
- [ ] Mobile layout responsive

---

## Deployment Notes

- No database changes required
- No backend API needed
- Works immediately after deployment
- Progress stored client-side only
- No configuration needed

---

## Future Ideas

- [ ] Video tutorials
- [ ] Achievement badges
- [ ] Context-sensitive help
- [ ] User analytics
- [ ] Multi-language support
- [ ] Community tutorials

---

## Support & Questions

- **How-to:** See TUTORIAL_INTEGRATION_GUIDE.js
- **Lessons:** See tutorialLessons.js
- **API:** See component JSDoc
- **Troubleshooting:** See TUTORIAL_README.md

---

**Tutorial System v1.0** - Ready to integrate!

Last Updated: December 2024
