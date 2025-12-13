import React, { createContext, useState, useCallback, useEffect } from 'react';

/**
 * TutorialContext
 * Manages tutorial state including:
 * - Current tutorial being shown
 * - Completed tutorials
 * - Whether new user has seen initial tutorial
 * - Tutorial preferences
 */
export const TutorialContext = createContext();

const STORAGE_KEYS = {
  HAS_SEEN_TUTORIAL: 'crittertrack_has_seen_initial_tutorial',
  COMPLETED_TUTORIALS: 'crittertrack_completed_tutorials',
  TUTORIAL_PREFERENCES: 'crittertrack_tutorial_preferences',
};

export const TutorialProvider = ({ children, userId }) => {
  const [hasSeenInitialTutorial, setHasSeenInitialTutorial] = useState(false);
  const [completedTutorials, setCompletedTutorials] = useState([]);
  const [currentTutorialId, setCurrentTutorialId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tutorial state from localStorage on mount and when userId changes
  useEffect(() => {
    setIsLoading(true);
    
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Use userId as part of storage key to keep tutorials per-user
    const userStoragePrefix = `${userId}_`;
    
    try {
      const savedHasSeenTutorial = localStorage.getItem(userStoragePrefix + STORAGE_KEYS.HAS_SEEN_TUTORIAL);
      if (savedHasSeenTutorial !== null) {
        setHasSeenInitialTutorial(JSON.parse(savedHasSeenTutorial));
      }

      const savedCompletedTutorials = localStorage.getItem(userStoragePrefix + STORAGE_KEYS.COMPLETED_TUTORIALS);
      if (savedCompletedTutorials) {
        setCompletedTutorials(JSON.parse(savedCompletedTutorials));
      }
    } catch (err) {
      console.warn('Failed to load tutorial state from localStorage:', err);
    }
    
    setIsLoading(false);
  }, [userId]);

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
  const markTutorialCompleted = useCallback((tutorialId) => {
    setCompletedTutorials(prev => {
      if (prev.includes(tutorialId)) return prev;
      const updated = [...prev, tutorialId];
      saveTutorialState(STORAGE_KEYS.COMPLETED_TUTORIALS, updated);
      return updated;
    });
  }, [saveTutorialState]);

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

    // Actions
    markInitialTutorialSeen,
    markTutorialCompleted,
    isTutorialCompleted,
    resetAllTutorials,
    restartTutorial,
    setCurrentTutorial,
    clearCurrentTutorial,
  };

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
