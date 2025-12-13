/**
 * EXACT CODE EXAMPLES FOR app.jsx INTEGRATION
 * 
 * Copy-paste ready code to add tutorial system to your main App component
 */

// ============================================================================
// OPTION A: MINIMAL INTEGRATION (Recommended for quick setup)
// ============================================================================

/**
 * Add these imports at the top of app.jsx:
 */
import { TutorialProvider } from './contexts/TutorialContext';
import { InitialTutorialModal, TutorialOverlay } from './components/TutorialOverlay';
import { useTutorial } from './contexts/TutorialContext';
import InfoTab from './components/InfoTab';

/**
 * Create a new component to handle tutorials:
 */
function TutorialManager() {
  const { 
    hasSeenInitialTutorial, 
    markInitialTutorialSeen,
    currentTutorialId,
    setCurrentTutorial,
    clearCurrentTutorial
  } = useTutorial();

  const [showInitialTutorial, setShowInitialTutorial] = useState(!hasSeenInitialTutorial);
  const [showInfoTab, setShowInfoTab] = useState(false);

  const handleStartTutorial = () => {
    markInitialTutorialSeen();
    setShowInitialTutorial(false);
    setCurrentTutorial('welcome');
  };

  const handleSkipTutorial = () => {
    markInitialTutorialSeen();
    setShowInitialTutorial(false);
  };

  return (
    <>
      {/* Initial Welcome Modal */}
      {showInitialTutorial && (
        <InitialTutorialModal
          onStart={handleStartTutorial}
          onSkip={handleSkipTutorial}
        />
      )}

      {/* Active Tutorial */}
      {currentTutorialId && (
        <TutorialOverlay
          lessonId={currentTutorialId}
          onClose={clearCurrentTutorial}
          onComplete={() => clearCurrentTutorial()}
        />
      )}

      {/* Info Tab Modal */}
      {showInfoTab && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <InfoTab onClose={() => setShowInfoTab(false)} />
        </div>
      )}

      {/* Info Button in Navigation (add this to your navbar) */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowInfoTab(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition"
          title="View tutorials and help"
        >
          <BookOpen size={20} />
          <span className="hidden sm:inline">Info</span>
        </button>
      </div>
    </>
  );
}

/**
 * In your main App component:
 */
function App() {
  const [userId, setUserId] = useState(null);

  // Get userId from your auth system
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Decode token or fetch user profile
      // setUserId(user.id);
    }
  }, []);

  return (
    <TutorialProvider userId={userId}>
      <div className="app">
        {/* Your existing app content */}
        <Header />
        <Navigation />
        <MainContent />

        {/* Add TutorialManager */}
        <TutorialManager />
      </div>
    </TutorialProvider>
  );
}

// ============================================================================
// OPTION B: ADVANCED INTEGRATION (with auto-advance between lessons)
// ============================================================================

/**
 * Enhanced version with automatic lesson progression
 */
const LESSON_SEQUENCE = [
  'welcome',
  'create-animals',
  'assign-parents',
  'create-litters',
  'profile-settings',
  'budget-basics'
];

function AdvancedTutorialManager() {
  const { 
    hasSeenInitialTutorial, 
    markInitialTutorialSeen,
    currentTutorialId,
    setCurrentTutorial,
    clearCurrentTutorial,
    completedTutorials
  } = useTutorial();

  const [showInitialTutorial, setShowInitialTutorial] = useState(!hasSeenInitialTutorial);
  const [showInfoTab, setShowInfoTab] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const handleStartTutorial = () => {
    markInitialTutorialSeen();
    setShowInitialTutorial(false);
    setCurrentTutorial('welcome');
  };

  const handleSkipTutorial = () => {
    markInitialTutorialSeen();
    setShowInitialTutorial(false);
  };

  const handleTutorialComplete = (lessonId) => {
    const currentIndex = LESSON_SEQUENCE.indexOf(lessonId);
    const nextIndex = currentIndex + 1;

    if (nextIndex < LESSON_SEQUENCE.length) {
      // Move to next lesson
      const nextLessonId = LESSON_SEQUENCE[nextIndex];
      setCurrentTutorial(nextLessonId);
    } else {
      // All lessons complete
      clearCurrentTutorial();
      console.log('All tutorials completed!');
    }
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
          onClose={clearCurrentTutorial}
          onComplete={handleTutorialComplete}
        />
      )}

      {showInfoTab && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <InfoTab onClose={() => setShowInfoTab(false)} />
        </div>
      )}

      {/* Navigation Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowInfoTab(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition"
        >
          <BookOpen size={20} />
          <span className="hidden sm:inline">Help</span>
        </button>
      </div>
    </>
  );
}

// ============================================================================
// OPTION C: CONDITIONAL INTEGRATION (Show tutorial only to true new users)
// ============================================================================

/**
 * Check if user is truly new (created in last 5 minutes)
 */
function ConditionalTutorialManager({ userProfile }) {
  const { 
    hasSeenInitialTutorial, 
    markInitialTutorialSeen
  } = useTutorial();

  const [showInitialTutorial, setShowInitialTutorial] = useState(false);
  const [showInfoTab, setShowInfoTab] = useState(false);
  const [currentTutorialId, setCurrentTutorialId] = useState(null);

  // Check if user is new
  useEffect(() => {
    if (userProfile && !hasSeenInitialTutorial) {
      const createdAt = new Date(userProfile.createdAt);
      const now = new Date();
      const minutesOld = (now - createdAt) / (1000 * 60);

      // Only show if account created in last 5 minutes
      if (minutesOld < 5) {
        setShowInitialTutorial(true);
      } else {
        // Mark as seen for returning users
        markInitialTutorialSeen();
      }
    }
  }, [userProfile, hasSeenInitialTutorial, markInitialTutorialSeen]);

  const handleStartTutorial = () => {
    markInitialTutorialSeen();
    setShowInitialTutorial(false);
    setCurrentTutorialId('welcome');
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
          onComplete={() => setCurrentTutorialId(null)}
        />
      )}

      {showInfoTab && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <InfoTab onClose={() => setShowInfoTab(false)} />
        </div>
      )}

      <button onClick={() => setShowInfoTab(true)}>
        <BookOpen size={20} /> Info
      </button>
    </>
  );
}

// ============================================================================
// COMPLETE MINIMAL app.jsx EXAMPLE
// ============================================================================

/**
 * Drop-in replacement for your existing App component
 */

import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { TutorialProvider } from './contexts/TutorialContext';
import { InitialTutorialModal, TutorialOverlay } from './components/TutorialOverlay';
import { useTutorial } from './contexts/TutorialContext';
import InfoTab from './components/InfoTab';

// Tutorial Manager sub-component
function TutorialManager() {
  const { 
    hasSeenInitialTutorial, 
    markInitialTutorialSeen,
    currentTutorialId,
    setCurrentTutorial,
    clearCurrentTutorial
  } = useTutorial();

  const [showInitialTutorial, setShowInitialTutorial] = useState(!hasSeenInitialTutorial);
  const [showInfoTab, setShowInfoTab] = useState(false);

  return (
    <>
      {showInitialTutorial && (
        <InitialTutorialModal
          onStart={() => {
            markInitialTutorialSeen();
            setShowInitialTutorial(false);
            setCurrentTutorial('welcome');
          }}
          onSkip={() => {
            markInitialTutorialSeen();
            setShowInitialTutorial(false);
          }}
        />
      )}

      {currentTutorialId && (
        <TutorialOverlay
          lessonId={currentTutorialId}
          onClose={clearCurrentTutorial}
          onComplete={() => clearCurrentTutorial()}
        />
      )}

      {showInfoTab && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <InfoTab onClose={() => setShowInfoTab(false)} />
        </div>
      )}

      <button
        onClick={() => setShowInfoTab(true)}
        className="fixed top-4 right-4 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition z-40"
      >
        <BookOpen size={20} />
        <span className="hidden sm:inline">Info</span>
      </button>
    </>
  );
}

// Main App component
export default function App() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get userId from your auth system
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      setUserId(profile.id);
    }
  }, []);

  return (
    <TutorialProvider userId={userId}>
      <div className="app min-h-screen bg-gray-100">
        {/* Your existing app layout */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-3xl font-bold text-gray-800">CritterTrack</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Your app content goes here */}
        </main>

        {/* Add Tutorial System */}
        <TutorialManager />
      </div>
    </TutorialProvider>
  );
}

// ============================================================================
// NOTES FOR IMPLEMENTATION
// ============================================================================

/*
1. IMPORTS NEEDED:
   - TutorialProvider from contexts/TutorialContext
   - useTutorial hook from contexts/TutorialContext
   - InitialTutorialModal, TutorialOverlay from components/TutorialOverlay
   - InfoTab from components/InfoTab
   - BookOpen from lucide-react

2. USERID REQUIREMENT:
   - Pass userId to TutorialProvider for progress persistence
   - If no userId, tutorial state won't persist
   - Get userId from your auth/login system

3. PLACEMENT:
   - Wrap entire app with TutorialProvider
   - TutorialManager can go anywhere (preferably top-level)
   - Info button should be in navigation for easy access

4. CUSTOMIZATION:
   - Modify initial tutorial sequence
   - Add/remove lessons as needed
   - Adjust styling with Tailwind classes
   - Add data-tutorial-target attributes to elements for highlighting

5. TESTING:
   - Use new incognito window to test as new user
   - Clear localStorage to reset tutorial progress
   - Check browser console for errors

6. DEPLOYMENT:
   - No database changes needed
   - No backend changes needed
   - Works immediately after deployment
*/
