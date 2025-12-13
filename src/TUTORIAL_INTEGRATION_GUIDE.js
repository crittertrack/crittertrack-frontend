/**
 * TUTORIAL SYSTEM INTEGRATION GUIDE
 * 
 * This guide shows how to integrate the tutorial system into the main CritterTrack application.
 * 
 * FILES CREATED:
 * ✅ /src/data/tutorialLessons.js - All tutorial lesson data
 * ✅ /src/contexts/TutorialContext.jsx - Tutorial state management
 * ✅ /src/components/TutorialOverlay.jsx - Tutorial modal and highlighting
 * ✅ /src/components/InfoTab.jsx - Info/Help tab for viewing all lessons
 * 
 * INTEGRATION STEPS:
 */

// ============================================================================
// STEP 1: Wrap your App with TutorialProvider
// ============================================================================
// In your app.jsx (or root component), add:

/*
import { TutorialProvider } from './contexts/TutorialContext';
import { InitialTutorialModal } from './components/TutorialOverlay';
import { useTutorial } from './contexts/TutorialContext';

// In your main App component:
function App() {
  const [userId, setUserId] = useState(null); // your user ID from auth/profile
  
  return (
    <TutorialProvider userId={userId}>
      <YourMainApp />
    </TutorialProvider>
  );
}
*/

// ============================================================================
// STEP 2: Add Tutorial Modal Trigger in Your Dashboard
// ============================================================================
// In the main dashboard/home component, add:

/*
import { InitialTutorialModal } from './components/TutorialOverlay';
import { useTutorial } from './contexts/TutorialContext';

function Dashboard() {
  const { hasSeenInitialTutorial, markInitialTutorialSeen } = useTutorial();
  const [showInitialTutorial, setShowInitialTutorial] = useState(!hasSeenInitialTutorial);
  const [currentTutorialId, setCurrentTutorialId] = useState(null);
  
  // Show initial welcome modal for new users
  useEffect(() => {
    if (!hasSeenInitialTutorial && userIsLoggedIn) {
      setShowInitialTutorial(true);
    }
  }, [hasSeenInitialTutorial, userIsLoggedIn]);
  
  const handleStartTutorial = () => {
    markInitialTutorialSeen();
    setShowInitialTutorial(false);
    setCurrentTutorialId('create-animals'); // Start with first lesson
  };
  
  const handleSkipTutorial = () => {
    markInitialTutorialSeen();
    setShowInitialTutorial(false);
  };
  
  return (
    <>
      {showInitialTutorial && (
        <InitialTutorialModal
          onStart={handleStartTutorial}
          onSkip={handleSkipTutorial}
        />
      )}
      
      {currentTutorialId && (
        <TutorialOverlay
          lessonId={currentTutorialId}
          onClose={() => setCurrentTutorialId(null)}
          onComplete={(lessonId) => {
            // Move to next lesson
            const nextLessonMap = {
              'welcome': 'create-animals',
              'create-animals': 'assign-parents',
              'assign-parents': 'create-litters',
              'create-litters': 'profile-settings',
              'profile-settings': 'budget-basics'
            };
            const nextId = nextLessonMap[lessonId];
            if (nextId) {
              setCurrentTutorialId(nextId);
            } else {
              setCurrentTutorialId(null);
            }
          }}
        />
      )}
      
      {/* Rest of your dashboard */}
    </>
  );
}
*/

// ============================================================================
// STEP 3: Add Info Tab Button to Navigation
// ============================================================================
// In your main navigation/header, add:

/*
import { BookOpen } from 'lucide-react';
import InfoTab from './components/InfoTab';

function Header() {
  const [showInfoTab, setShowInfoTab] = useState(false);
  
  return (
    <>
      <nav>
        {/* ... other nav items ... */}
        <button
          onClick={() => setShowInfoTab(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100"
          title="View tutorials and help"
        >
          <BookOpen size={20} />
          <span className="hidden sm:inline">Info</span>
        </button>
      </nav>
      
      {showInfoTab && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <InfoTab onClose={() => setShowInfoTab(false)} />
        </div>
      )}
    </>
  );
}
*/

// ============================================================================
// STEP 4: Add Tutorial Data Attributes to Key UI Elements (Optional)
// ============================================================================
// For better highlighting, add data-tutorial-target attributes:

/*
// In your Animals List section:
<button 
  data-tutorial-target="add-animal-btn"
  onClick={handleAddAnimal}
>
  Add Animal
</button>

// In your Litter Management section:
<div data-tutorial-target="litter-management-tab">
  {/* Litter content */}
</div>

// In your Profile section:
<div data-tutorial-target="profile-menu">
  {/* Profile menu */}
</div>

// In your Budget section:
<div data-tutorial-target="budget-tab">
  {/* Budget content */}
</div>
*/

// ============================================================================
// STEP 5: Import Tutorial Components Throughout Your App
// ============================================================================
// As needed in different sections:

/*
import { TutorialOverlay, TutorialHighlight } from './components/TutorialOverlay';
import { useTutorial } from './contexts/TutorialContext';

// In any component that benefits from tutorial highlighting:
function AnimalSection() {
  const { currentTutorialId } = useTutorial();
  
  return (
    <>
      {currentTutorialId === 'create-animals' && (
        <TutorialHighlight
          elementSelector="[data-tutorial-target='add-animal-btn']"
          onHighlightClose={() => {}} // handled by TutorialOverlay
        />
      )}
      
      {/* Your component content */}
    </>
  );
}
*/

// ============================================================================
// STEP 6: Complete Usage Example
// ============================================================================
// Here's a complete minimal example of integration:

/*
import React, { useState, useEffect } from 'react';
import { TutorialProvider } from './contexts/TutorialContext';
import { InitialTutorialModal, TutorialOverlay } from './components/TutorialOverlay';
import InfoTab from './components/InfoTab';
import { useTutorial } from './contexts/TutorialContext';
import { BookOpen } from 'lucide-react';

function DashboardWithTutorial() {
  const { 
    hasSeenInitialTutorial, 
    markInitialTutorialSeen,
    currentTutorialId,
    setCurrentTutorial,
    clearCurrentTutorial
  } = useTutorial();
  
  const [showInitialTutorial, setShowInitialTutorial] = useState(!hasSeenInitialTutorial);
  const [showInfoTab, setShowInfoTab] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  // Check if this is a new user on first load
  useEffect(() => {
    // Your auth logic here
    // If new user, showInitialTutorial will be true
  }, []);
  
  return (
    <>
      {/* Initial Welcome Tutorial */}
      {showInitialTutorial && (
        <InitialTutorialModal
          onStart={() => {
            markInitialTutorialSeen();
            setShowInitialTutorial(false);
            setCurrentTutorial('create-animals');
          }}
          onSkip={() => {
            markInitialTutorialSeen();
            setShowInitialTutorial(false);
          }}
        />
      )}
      
      {/* Running Tutorial */}
      {currentTutorialId && (
        <TutorialOverlay
          lessonId={currentTutorialId}
          onClose={clearCurrentTutorial}
          onComplete={(lessonId) => {
            // Auto-advance to next lesson or close
            clearCurrentTutorial();
          }}
        />
      )}
      
      {/* Header with Info Button */}
      <header className="bg-white shadow">
        <div className="flex justify-between items-center p-4">
          <h1>CritterTrack</h1>
          <button
            onClick={() => setShowInfoTab(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg"
          >
            <BookOpen size={20} />
            Info
          </button>
        </div>
      </header>
      
      {/* Info Tab Modal */}
      {showInfoTab && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <InfoTab onClose={() => setShowInfoTab(false)} />
        </div>
      )}
      
      {/* Your main content */}
      <main>
        {/* Animals Section */}
        <section data-tutorial-target="add-animal-btn">
          <h2>My Animals</h2>
          <button>+ Add Animal</button>
          {/* Animal list content */}
        </section>
        
        {/* Litters Section */}
        <section data-tutorial-target="litter-management-tab">
          <h2>Litters</h2>
          {/* Litter management content */}
        </section>
        
        {/* Budget Section */}
        <section data-tutorial-target="budget-tab">
          <h2>Budget</h2>
          {/* Budget content */}
        </section>
      </main>
    </>
  );
}

// Main App with Provider
export default function App() {
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    // Your auth logic to get userId
  }, []);
  
  return (
    <TutorialProvider userId={userId}>
      <DashboardWithTutorial />
    </TutorialProvider>
  );
}
*/

// ============================================================================
// CUSTOMIZATION OPTIONS
// ============================================================================

/*
ADDING NEW LESSONS:
1. Edit /src/data/tutorialLessons.js
2. Add a new lesson to TUTORIAL_LESSONS.onboarding or .features
3. Each lesson must have:
   - id: unique identifier
   - title: display name
   - description: short description
   - category: lesson category
   - steps: array of step objects with stepNumber, title, content, tips

MODIFYING EXISTING LESSONS:
1. Open /src/data/tutorialLessons.js
2. Find the lesson to modify
3. Update title, description, steps as needed
4. Changes are automatically reflected everywhere the tutorial is used

TRACKING COMPLETION:
- Lessons are automatically marked as complete when users finish them
- Progress is stored per user in localStorage
- Use useTutorial() hook to access completion status:
  const { isTutorialCompleted } = useTutorial();
  const isComplete = isTutorialCompleted('create-animals');

RESETTING TUTORIALS:
- Users can restart individual tutorials from the Info tab
- Admin can provide a "Reset All Tutorials" button:
  const { resetAllTutorials } = useTutorial();
  <button onClick={resetAllTutorials}>Reset All Tutorials</button>
*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*
Issue: Tutorial not showing on first login
Solution: Ensure TutorialProvider wraps your app and localStorage is enabled

Issue: Tutorial highlighting not working
Solution: Make sure data-tutorial-target attributes are set on the elements

Issue: Tutorial context not available
Solution: Ensure component is wrapped by TutorialProvider and using useTutorial() hook

Issue: Progress not persisting
Solution: Check that localStorage is enabled and userId is being passed to TutorialProvider

For more help, see the tutorialLessons.js file for the complete lesson structure.
*/

export default {
  message: 'This is an integration guide file. See comments above for implementation details.'
};
