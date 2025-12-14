import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

/**
 * TutorialContext
 * Manages tutorial state including:
 * - Current tutorial being shown
 * - Completed tutorials (synced with backend)
 * - Whether new user has seen initial tutorial
 * - Tutorial preferences
 */
export const TutorialContext = createContext();

const STORAGE_KEYS = {
  HAS_SEEN_TUTORIAL: 'crittertrack_has_seen_initial_tutorial',
  COMPLETED_TUTORIALS: 'crittertrack_completed_tutorials',
  TUTORIAL_PREFERENCES: 'crittertrack_tutorial_preferences',
};

export const TutorialProvider = ({ children, userId, authToken, API_BASE_URL }) => {
  const [hasSeenInitialTutorial, setHasSeenInitialTutorial] = useState(false);
  const [completedTutorials, setCompletedTutorials] = useState([]);
  const [currentTutorialId, setCurrentTutorialId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasCompletedAdvancedFeatures, setHasCompletedAdvancedFeatures] = useState(false);

  // Load tutorial state from backend when user logs in
  useEffect(() => {
    const loadTutorialProgress = async () => {
      setIsLoading(true);
      
      if (!userId || !authToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch tutorial progress from backend
        const response = await axios.get(`${API_BASE_URL}/users/tutorial-progress`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        console.log('Tutorial progress loaded from backend:', response.data);
        
        setCompletedTutorials(response.data.completedTutorials || []);
        setHasCompletedOnboarding(response.data.hasCompletedOnboarding || false);
        setHasCompletedAdvancedFeatures(response.data.hasCompletedAdvancedFeatures || false);
        
        // Also sync with localStorage for offline support
        const userStoragePrefix = `${userId}_`;
        localStorage.setItem(userStoragePrefix + STORAGE_KEYS.COMPLETED_TUTORIALS, JSON.stringify(response.data.completedTutorials || []));
        localStorage.setItem(userStoragePrefix + STORAGE_KEYS.HAS_SEEN_TUTORIAL, JSON.stringify(response.data.hasCompletedOnboarding || false));
        
        console.log('Tutorial state synced to localStorage for user:', userId);
      } catch (error) {
        console.error('Failed to load tutorial progress from backend:', error);
        
        // Fallback to localStorage
        const userStoragePrefix = `${userId}_`;
        try {
          const savedCompletedTutorials = localStorage.getItem(userStoragePrefix + STORAGE_KEYS.COMPLETED_TUTORIALS);
          const savedHasSeenTutorial = localStorage.getItem(userStoragePrefix + STORAGE_KEYS.HAS_SEEN_TUTORIAL);
          
          if (savedCompletedTutorials) {
            const tutorials = JSON.parse(savedCompletedTutorials);
            setCompletedTutorials(tutorials);
            console.log('Tutorial progress loaded from localStorage:', tutorials);
          }
          
          if (savedHasSeenTutorial !== null) {
            const hasCompleted = JSON.parse(savedHasSeenTutorial);
            setHasSeenInitialTutorial(hasCompleted);
            setHasCompletedOnboarding(hasCompleted);
          }
        } catch (err) {
          console.error('Failed to load tutorial state from localStorage:', err);
        }
      }
      
      setIsLoading(false);
    };

    loadTutorialProgress();
  }, [userId, authToken, API_BASE_URL]);

  // Save tutorial state to localStorage
  const saveTutorialState = useCallback((key, value) => {
    if (!userId) return;

    const userStoragePrefix = `${userId}_`;
    try {
      localStorage.setItem(userStoragePrefix + key, JSON.stringify(value));
    } catch (err) {
      console.warn('Failed to save tutorial state to localStorage:', err);
    }
  }, [userId]);

  // Mark initial tutorial as seen
  const markInitialTutorialSeen = useCallback(() => {
    setHasSeenInitialTutorial(true);
    saveTutorialState(STORAGE_KEYS.HAS_SEEN_TUTORIAL, true);
  }, [saveTutorialState]);

  // Mark a tutorial as completed
  const markTutorialCompleted = useCallback(async (tutorialId, isOnboardingComplete = false, isAdvancedFeaturesComplete = false) => {
    // Save to backend first
    if (authToken && API_BASE_URL) {
      try {
        const response = await axios.post(`${API_BASE_URL}/users/tutorial-complete`, {
          tutorialId,
          isOnboardingComplete,
          isAdvancedFeaturesComplete
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        // Update state with backend response
        setCompletedTutorials(response.data.completedTutorials || []);
        setHasCompletedOnboarding(response.data.hasCompletedOnboarding || false);
        setHasCompletedAdvancedFeatures(response.data.hasCompletedAdvancedFeatures || false);
        
        // Also update localStorage
        const userStoragePrefix = `${userId}_`;
        localStorage.setItem(userStoragePrefix + STORAGE_KEYS.COMPLETED_TUTORIALS, JSON.stringify(response.data.completedTutorials || []));
        
        if (response.data.hasCompletedOnboarding) {
          setHasSeenInitialTutorial(true);
          localStorage.setItem(userStoragePrefix + STORAGE_KEYS.HAS_SEEN_TUTORIAL, JSON.stringify(true));
        }
        
        console.log('Tutorial progress saved successfully:', response.data);
      } catch (error) {
        console.error('Failed to save tutorial completion to backend:', error);
        // Fallback to localStorage only
        setCompletedTutorials(prev => {
          if (prev.includes(tutorialId)) return prev;
          const updated = [...prev, tutorialId];
          saveTutorialState(STORAGE_KEYS.COMPLETED_TUTORIALS, updated);
          return updated;
        });

        if (isOnboardingComplete) {
          setHasCompletedOnboarding(true);
          setHasSeenInitialTutorial(true);
          saveTutorialState(STORAGE_KEYS.HAS_SEEN_TUTORIAL, true);
        }
        
        if (isAdvancedFeaturesComplete) {
          setHasCompletedAdvancedFeatures(true);
        }
      }
    } else {
      // No backend available, use localStorage only
      setCompletedTutorials(prev => {
        if (prev.includes(tutorialId)) return prev;
        const updated = [...prev, tutorialId];
        saveTutorialState(STORAGE_KEYS.COMPLETED_TUTORIALS, updated);
        return updated;
      });

      if (isOnboardingComplete) {
        setHasCompletedOnboarding(true);
        setHasSeenInitialTutorial(true);
        saveTutorialState(STORAGE_KEYS.HAS_SEEN_TUTORIAL, true);
      }
      
      if (isAdvancedFeaturesComplete) {
        setHasCompletedAdvancedFeatures(true);
      }
    }
  }, [saveTutorialState, authToken, API_BASE_URL, userId]);

  // Check if a tutorial has been completed
  const isTutorialCompleted = useCallback((tutorialId) => {
    return completedTutorials.includes(tutorialId);
  }, [completedTutorials]);

  // Reset all tutorials (for testing or user preference)
  const resetAllTutorials = useCallback(() => {
    setHasSeenInitialTutorial(false);
    setCompletedTutorials([]);
    setCurrentTutorialId(null);
    
    if (!userId) return;
    
    const userStoragePrefix = `${userId}_`;
    try {
      localStorage.removeItem(userStoragePrefix + STORAGE_KEYS.HAS_SEEN_TUTORIAL);
      localStorage.removeItem(userStoragePrefix + STORAGE_KEYS.COMPLETED_TUTORIALS);
    } catch (err) {
      console.warn('Failed to reset tutorials:', err);
    }
  }, [userId]);

  // Restart a specific tutorial
  const restartTutorial = useCallback((tutorialId) => {
    setCompletedTutorials(prev => {
      const updated = prev.filter(id => id !== tutorialId);
      saveTutorialState(STORAGE_KEYS.COMPLETED_TUTORIALS, updated);
      return updated;
    });
    setCurrentTutorialId(tutorialId);
  }, [saveTutorialState]);

  // Set current tutorial
  const setCurrentTutorial = useCallback((tutorialId) => {
    setCurrentTutorialId(tutorialId);
  }, []);

  // Clear current tutorial
  const clearCurrentTutorial = useCallback(() => {
    setCurrentTutorialId(null);
  }, []);

  const value = {
    // State
    hasSeenInitialTutorial,
    completedTutorials,
    currentTutorialId,
    isLoading,
    hasCompletedOnboarding,
    hasCompletedAdvancedFeatures,

    // Actions
    markInitialTutorialSeen,
    markTutorialCompleted,
    isTutorialCompleted,
    resetAllTutorials,
    restartTutorial,
    setCurrentTutorial,
    clearCurrentTutorial,
  };

  // Don't render children until we've loaded tutorial state
  // This prevents the tutorial from incorrectly showing while we're still fetching data
  if (isLoading) {
    return (
      <TutorialContext.Provider value={value}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      </TutorialContext.Provider>
    );
  }

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

// Hook to use tutorial context
export const useTutorial = () => {
  const context = React.useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};
