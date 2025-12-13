# CritterTrack Tutorial System

A comprehensive tutorial and help system for new and returning users of CritterTrack breeding management application.

## Overview

The tutorial system consists of:

1. **Initial Tutorial** - A guided walkthrough for brand new users covering core features
2. **Info Tab** - A searchable library of all tutorials and advanced features accessible anytime
3. **Tutorial Context** - State management for tracking completion and user progress
4. **Interactive Components** - Modal overlays, step highlighting, and progress tracking

## Features

✅ **Complete Lesson Library**
- 5 core lessons for getting started
- 6 advanced feature guides
- 25+ individual steps with tips

✅ **New User Onboarding**
- Welcome modal on first login
- Optional initial tutorial
- Option to skip or start

✅ **Progress Tracking**
- Per-user completion tracking
- Persistent progress via localStorage
- Restart individual tutorials anytime

✅ **Easy Access**
- Info tab in main navigation
- Tutorial restart from Info tab
- Search and filter by category

✅ **Beautiful UI**
- Modern modal design
- Progress indicators
- Step navigation with keyboard support
- Highlights key UI elements

## Core Lessons (Onboarding)

1. **Welcome** - Introduction to CritterTrack
2. **Creating Animals** - How to add animals to your collection
3. **Assigning Parents** - Building pedigrees and family trees
4. **Creating Litters** - Managing breeding records
5. **Profile Settings** - Customizing your profile and privacy
6. **Budget Tracking** - Managing expenses and income

## Advanced Features (Info Tab)

1. **Searching & Filtering** - Finding animals quickly
2. **Genetics Calculator** - Predicting offspring phenotypes (mice)
3. **Transferring Animals** - Tracking sales and rehoming
4. **Pedigree Charts** - Exporting family trees
5. **Public Profiles** - Sharing with the community
6. **Understanding COI** - Coefficient of Inbreeding explained

## File Structure

```
src/
├── data/
│   └── tutorialLessons.js          # All lesson content
├── contexts/
│   └── TutorialContext.jsx          # State management
├── components/
│   ├── TutorialOverlay.jsx          # Modal and UI components
│   └── InfoTab.jsx                  # Tutorial library view
└── TUTORIAL_INTEGRATION_GUIDE.js    # Integration instructions
```

## Quick Start

### 1. Setup

Wrap your app with the TutorialProvider:

```jsx
import { TutorialProvider } from './contexts/TutorialContext';

function App() {
  const [userId, setUserId] = useState(null);
  
  return (
    <TutorialProvider userId={userId}>
      {/* Your app content */}
    </TutorialProvider>
  );
}
```

### 2. Show Initial Tutorial

In your dashboard component:

```jsx
import { InitialTutorialModal } from './components/TutorialOverlay';
import { useTutorial } from './contexts/TutorialContext';

function Dashboard() {
  const { hasSeenInitialTutorial, markInitialTutorialSeen } = useTutorial();
  const [showTutorial, setShowTutorial] = useState(!hasSeenInitialTutorial);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  
  return (
    <>
      {showTutorial && (
        <InitialTutorialModal
          onStart={() => {
            markInitialTutorialSeen();
            setShowTutorial(false);
            setCurrentLessonId('create-animals');
          }}
          onSkip={() => {
            markInitialTutorialSeen();
            setShowTutorial(false);
          }}
        />
      )}
      
      {currentLessonId && (
        <TutorialOverlay
          lessonId={currentLessonId}
          onClose={() => setCurrentLessonId(null)}
          onComplete={() => setCurrentLessonId(null)}
        />
      )}
    </>
  );
}
```

### 3. Add Info Button to Navigation

```jsx
import { BookOpen } from 'lucide-react';
import InfoTab from './components/InfoTab';

function Header() {
  const [showInfoTab, setShowInfoTab] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowInfoTab(true)}>
        <BookOpen size={20} />
        Info
      </button>
      
      {showInfoTab && (
        <div className="fixed inset-0 z-50">
          <InfoTab onClose={() => setShowInfoTab(false)} />
        </div>
      )}
    </>
  );
}
```

### 4. Add Data Attributes (Optional)

For better element highlighting, add to key UI elements:

```jsx
<button data-tutorial-target="add-animal-btn">
  Add Animal
</button>

<div data-tutorial-target="litter-management-tab">
  Litter Management
</div>
```

## API Reference

### useTutorial Hook

```jsx
const {
  // State
  hasSeenInitialTutorial,      // boolean
  completedTutorials,          // string[]
  currentTutorialId,           // string | null
  isLoading,                   // boolean
  
  // Actions
  markInitialTutorialSeen,     // () => void
  markTutorialCompleted,       // (id: string) => void
  isTutorialCompleted,         // (id: string) => boolean
  resetAllTutorials,           // () => void
  restartTutorial,             // (id: string) => void
  setCurrentTutorial,          // (id: string) => void
  clearCurrentTutorial,        // () => void
} = useTutorial();
```

### Components

#### InitialTutorialModal

Shows welcome screen for new users.

```jsx
<InitialTutorialModal
  onStart={() => startTutorial()}
  onSkip={() => skipTutorial()}
/>
```

#### TutorialOverlay

Shows the active tutorial lesson.

```jsx
<TutorialOverlay
  lessonId="create-animals"
  onClose={() => closeTutorial()}
  onComplete={(lessonId) => handleComplete(lessonId)}
/>
```

#### InfoTab

Full library of all tutorials and features.

```jsx
<InfoTab
  onClose={() => closeInfoTab()}
/>
```

#### TutorialHighlight

Highlights a specific element on screen.

```jsx
<TutorialHighlight
  elementSelector="[data-tutorial-target='add-animal-btn']"
  onHighlightClose={() => {}}
/>
```

## Lesson Structure

Each lesson has this structure:

```javascript
{
  id: 'lesson-id',
  title: 'Lesson Title',
  description: 'Brief description',
  category: 'core-features',
  steps: [
    {
      stepNumber: 1,
      title: 'Step Title',
      content: 'Step description and instructions',
      highlightElement: '[data-tutorial-target="element-id"]', // optional
      tips: [
        'Helpful tip 1',
        'Helpful tip 2'
      ]
    },
    // More steps...
  ]
}
```

## Customization

### Adding a New Lesson

1. Open `src/data/tutorialLessons.js`
2. Add to `TUTORIAL_LESSONS.onboarding` or `.features`:

```javascript
{
  id: 'my-new-lesson',
  title: 'My New Lesson',
  description: 'Teaches how to do X',
  category: 'core-features',
  steps: [
    {
      stepNumber: 1,
      title: 'First Step',
      content: 'This is how you do the first part...',
      tips: ['Tip 1', 'Tip 2']
    },
    // More steps...
  ]
}
```

### Modifying Existing Lessons

Just edit the lesson in `tutorialLessons.js` - changes take effect immediately.

### Changing Colors/Styling

Edit the Tailwind classes in:
- `TutorialOverlay.jsx` - Main tutorial styling
- `InfoTab.jsx` - Info tab styling

## Storage & Persistence

Tutorial progress is stored per-user in localStorage:

```
${userId}_crittertrack_has_seen_initial_tutorial
${userId}_crittertrack_completed_tutorials
```

User must be logged in (userId provided to TutorialProvider) for progress to be saved.

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript
- localStorage API
- React 18+
- Tailwind CSS

## Performance

- Minimal bundle size (~10KB gzipped)
- Lazy loads lesson content
- Uses localStorage for persistence
- No external dependencies beyond React

## Accessibility

- Keyboard navigation support
- High contrast colors
- Clear focus states
- Semantic HTML
- ARIA labels where appropriate

## Future Enhancements

- [ ] Video tutorials
- [ ] Interactive code examples
- [ ] Achievement badges for completed lessons
- [ ] Tutorial recommendations based on user activity
- [ ] Analytics tracking of tutorial completion
- [ ] Community-contributed tutorials
- [ ] Multi-language support
- [ ] Contextual help tooltips throughout app

## Troubleshooting

### Tutorial not showing on first login
- Check TutorialProvider wraps your app
- Verify localStorage is enabled
- Check browser console for errors

### Progress not saving
- Ensure userId is being passed to TutorialProvider
- Check localStorage is enabled
- Verify no browser storage restrictions

### Element highlighting not working
- Add data-tutorial-target attributes to UI elements
- Ensure element is visible/not hidden
- Check element selector is correct

### Tutorial context not available
- Verify component is wrapped by TutorialProvider
- Use useTutorial() hook inside TutorialProvider
- Check component is not in error boundary

## Support

For questions or issues:
1. Check this README
2. Review TUTORIAL_INTEGRATION_GUIDE.js
3. Check tutorialLessons.js for lesson structure
4. Review component source code for implementation details

## License

Same as CritterTrack main application.

---

**Tutorial System v1.0** - Comprehensive onboarding and help system for CritterTrack
