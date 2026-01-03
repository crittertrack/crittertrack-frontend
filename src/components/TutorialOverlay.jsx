import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check, BookOpen } from 'lucide-react';
import { TUTORIAL_LESSONS } from '../data/tutorialLessonsNew';
import { useTutorial } from '../contexts/TutorialContext';

/**
 * TutorialOverlay
 * Main modal component that shows tutorial lessons with navigation
 */
export const TutorialOverlay = React.forwardRef(({ lessonId, onClose, onComplete, onStepChange }, ref) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showAdvancedFeaturesPrompt, setShowAdvancedFeaturesPrompt] = useState(false);
  const { markTutorialCompleted, completedTutorials } = useTutorial();

  const lesson = TUTORIAL_LESSONS.onboarding.find(l => l.id === lessonId) || 
                 TUTORIAL_LESSONS.features.find(l => l.id === lessonId) ||
                 TUTORIAL_LESSONS.advanced.find(l => l.id === lessonId);

  const currentStep = lesson?.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = lesson ? currentStepIndex === lesson.steps.length - 1 : false;

  // Expose advance method to parent component
  React.useImperativeHandle(ref, () => ({
    advanceStep: () => {
      if (!isLastStep) {
        setCurrentStepIndex(prev => prev + 1);
      }
    },
    goToStep: (stepIndex) => {
      if (stepIndex >= 0 && stepIndex < lesson?.steps.length) {
        setCurrentStepIndex(stepIndex);
      }
    }
  }), [isLastStep, lesson]);

  // Notify parent when step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStepIndex, currentStep);
    }
  }, [currentStepIndex, currentStep, onStepChange]);

  // Reset step index and completion state when lesson changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setShowAdvancedFeaturesPrompt(false);
  }, [lessonId]);

  // Handle waitForAction and actionType: 'click' - automatically advance when highlighted element is clicked
  useEffect(() => {
    const shouldWaitForClick = currentStep?.waitForAction || currentStep?.actionType === 'click';
    
    if (!shouldWaitForClick || !currentStep?.highlightElement) {
      return;
    }

    const handleElementClick = (e) => {
      // Check if the clicked element or any parent matches the selector
      const target = e.target.closest(currentStep.highlightElement);
      if (target) {
        // Small delay to let the click action complete before advancing
        setTimeout(() => {
          if (!isLastStep) {
            setCurrentStepIndex(prev => prev + 1);
          } else {
            // If this is the last step of the lesson, complete it
            if (lesson) {
              // Determine if this is the final onboarding lesson (budget-basics)
              const isOnboardingComplete = lesson.id === 'budget-basics';
              
              // Determine if this is the final advanced features lesson
              const isAdvancedFeaturesComplete = lesson.id === 'advanced-features-complete';
              
              markTutorialCompleted(lesson.id, isOnboardingComplete, isAdvancedFeaturesComplete);

              // Always show advanced features prompt after completing onboarding
              if (isOnboardingComplete) {
                setShowAdvancedFeaturesPrompt(true);
                return;
              }
            }
            
            if (onComplete) {
              onComplete(lesson?.id);
            }
          }
        }, 300);
      }
    };

    document.addEventListener('click', handleElementClick, true);

    return () => {
      document.removeEventListener('click', handleElementClick, true);
    };
  }, [currentStep, isLastStep, lesson, markTutorialCompleted, onComplete]);

  const handleComplete = useCallback(() => {
    if (lesson) {
      // Determine if this is the final onboarding lesson (budget-basics)
      const isOnboardingComplete = lesson.id === 'budget-basics';
      
      // Determine if this is the final advanced features lesson
      const isAdvancedFeaturesComplete = lesson.id === 'advanced-features-complete';
      
      markTutorialCompleted(lesson.id, isOnboardingComplete, isAdvancedFeaturesComplete);

      // Always show advanced features prompt after completing onboarding
      if (isOnboardingComplete) {
        setShowAdvancedFeaturesPrompt(true);
        return; // Don't close yet, show the prompt
      }
    }
    
    if (onComplete) {
      onComplete(lesson?.id);
    }
  }, [lesson, markTutorialCompleted, onComplete]);

  const handleNext = useCallback(() => {
    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [isLastStep, handleComplete]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [isFirstStep]);

  const handleSkip = useCallback(() => {
    // Check if this is the final onboarding lesson (budget-basics)
    if (lesson && lesson.id === 'budget-basics') {
      markTutorialCompleted(lesson.id, true, false);
      setShowAdvancedFeaturesPrompt(true);
      return; // Don't close yet, show the prompt
    }
    
    if (onComplete) {
      onComplete();
    }
  }, [lesson, markTutorialCompleted, onComplete]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  if (!lesson || !currentStep) return null;

  const progress = ((currentStepIndex + 1) / lesson.steps.length) * 100;

  // Determine which tutorial array we're in and calculate lesson number
  const isInOnboarding = TUTORIAL_LESSONS.onboarding.some(l => l.id === lessonId);
  const isInFeatures = TUTORIAL_LESSONS.features.some(l => l.id === lessonId);
  const isInAdvanced = TUTORIAL_LESSONS.advanced.some(l => l.id === lessonId);
  
  let lessonNumber = 1;
  let totalLessons = 1;
  
  if (isInOnboarding) {
    lessonNumber = TUTORIAL_LESSONS.onboarding.findIndex(l => l.id === lessonId) + 1;
    totalLessons = TUTORIAL_LESSONS.onboarding.length;
  } else if (isInFeatures) {
    lessonNumber = TUTORIAL_LESSONS.features.findIndex(l => l.id === lessonId) + 1;
    totalLessons = TUTORIAL_LESSONS.features.length;
  } else if (isInAdvanced) {
    lessonNumber = TUTORIAL_LESSONS.advanced.findIndex(l => l.id === lessonId) + 1;
    totalLessons = TUTORIAL_LESSONS.advanced.length;
  }

  return (
    <>
      {/* Tutorial Panel - floating on the side */}
      <div className="fixed top-6 left-6 w-96 bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-[9999]">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-black p-4 flex justify-between items-start flex-shrink-0">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} />
              <span className="text-xs font-semibold opacity-80">Lesson {lessonNumber} of {totalLessons}</span>
            </div>
            <h2 className="text-lg font-bold">{lesson.title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-black/50 hover:text-black transition p-1 rounded-lg hover:bg-white/20 flex-shrink-0"
            title="Close tutorial"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Step Counter */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">
              Step {currentStepIndex + 1} of {lesson.steps.length}
            </span>
            <div className="flex gap-1">
              {lesson.steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    index === currentStepIndex ? 'bg-primary w-4' : 
                    index < currentStepIndex ? 'bg-accent' :
                    'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Title */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {currentStep.title}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {currentStep.content}
            </p>
          </div>

          {/* Tips */}
          {currentStep.tips && currentStep.tips.length > 0 && (
            <div className="bg-blue-50 border-l-3 border-blue-400 rounded p-3">
              <h4 className="text-xs font-bold text-blue-900 mb-1">💡 Tips:</h4>
              <ul className="space-y-1">
                {currentStep.tips.map((tip, index) => (
                  <li key={index} className="text-xs text-blue-800 flex gap-2">
                    <span className="text-blue-400 flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Highlighted element indicator */}
          {currentStep.highlightElement && !currentStep.hideHighlightPrompt && (
            <div className="bg-amber-50 border-l-3 border-amber-400 rounded p-3">
              <p className="text-xs text-amber-800">
                ✨ <strong>Look for the highlighted element on the screen →</strong>
              </p>
            </div>
          )}
        </div>

        {/* Footer with Navigation */}
        <div className="border-t border-gray-200 bg-gray-50 p-3 flex items-center justify-between gap-2 flex-shrink-0">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white"
          >
            <ChevronLeft size={14} />
            <span className="font-semibold hidden sm:inline">Prev</span>
          </button>

          <div className="flex items-center gap-2 flex-1 justify-end">
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 text-xs text-gray-700 hover:text-gray-900 font-semibold transition hover:bg-white rounded"
            >
              Skip
            </button>

            {currentStep?.actionType === 'startNextTour' ? (
              <>
                <button
                  onClick={handleSkip}
                  className="px-4 py-1.5 text-xs text-gray-700 hover:text-gray-900 font-semibold transition hover:bg-white rounded"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    if (onComplete) {
                      const nextTour = currentStep?.actionData?.nextTour || 'features';
                      const completeAction = nextTour === 'advanced' ? 'start-advanced' : 'start-features';
                      onComplete(completeAction);
                    }
                  }}
                  className="flex items-center gap-1 px-4 py-1.5 rounded text-xs font-semibold transition bg-accent hover:bg-accent/90 text-white"
                >
                  <ChevronRight size={14} />
                  {currentStep?.actionData?.nextTour === 'advanced' ? 'Start Advanced Features Tour' : 'Start Key Features Tour'}
                </button>
              </>
            ) : (
              <button
                onClick={handleNext}
                className={`flex items-center gap-1 px-4 py-1.5 rounded text-xs font-semibold transition ${
                  isLastStep
                    ? 'bg-accent hover:bg-accent/90 text-white'
                    : 'bg-primary hover:bg-primary/90 text-black'
                }`}
              >
                {isLastStep ? (
                  <>
                    <Check size={14} />
                    Done
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Features Prompt - shown after completing onboarding */}
      {showAdvancedFeaturesPrompt && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[10000]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎓</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Great job completing the basics!
              </h2>
              <p className="text-gray-600">
                Ready to explore advanced features like genetics calculators, COI tracking, and more?
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowAdvancedFeaturesPrompt(false);
                  if (onComplete) {
                    onComplete('start-advanced');
                  }
                }}
                className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                <BookOpen size={18} />
                Start Advanced Features Tutorial
              </button>
              
              <button
                onClick={() => {
                  setShowAdvancedFeaturesPrompt(false);
                  if (onComplete) {
                    onComplete(lesson?.id);
                  }
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition"
              >
                Skip for now
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              You can access all tutorials anytime from the Help tab
            </p>
          </div>
        </div>
      )}
    </>
  );
});

TutorialOverlay.displayName = 'TutorialOverlay';

/**
 * InitialTutorialModal
 * Welcome screen for new users - lets them choose to start tutorial or skip
 */
export const InitialTutorialModal = ({ onStart, onSkip, onPermanentSkip }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-auto flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header with background */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-accent text-black p-8 text-center flex-shrink-0">
          <BookOpen size={48} className="mx-auto mb-3 opacity-80" />
          <h2 className="text-3xl font-bold mb-2">Welcome to CritterTrack! 🎉</h2>
          <p className="text-base opacity-90">
            Your personal breeding database and genetics tracker
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <p className="text-base text-gray-700 leading-relaxed">
            Whether you're just getting started or a seasoned breeder, CritterTrack helps you manage your animals, track genetics, and organize your breeding program.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
            <h3 className="text-base font-bold text-blue-900 mb-2">Quick Start Guide Available</h3>
            <p className="text-sm text-blue-800 mb-3">
              We've created a guided tour covering the essentials:
            </p>
            <ul className="space-y-1 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-blue-600 flex-shrink-0" />
                <span>Creating your first animals</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-blue-600 flex-shrink-0" />
                <span>Assigning parents to build pedigrees</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-blue-600 flex-shrink-0" />
                <span>Managing litters and breeding records</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-blue-600 flex-shrink-0" />
                <span>Tracking breeding costs and income</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-blue-600 flex-shrink-0" />
                <span>And more!</span>
              </li>
            </ul>
          </div>

          <p className="text-gray-600 text-xs">
            💡 <strong>Tip:</strong> You can always access tutorials later from the Help section at any time.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={onPermanentSkip}
            className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:underline transition"
          >
            Don't show this again
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-semibold transition hover:bg-white rounded-lg border border-gray-300"
            >
              Skip for Now
            </button>
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-black font-bold rounded-lg transition shadow-md text-sm"
            >
              <BookOpen size={18} />
              Start Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

InitialTutorialModal.displayName = 'InitialTutorialModal';

/**
 * TutorialHighlight
 * Highlights a specific element on the screen and shows a pointer
 * Should be rendered as an overlay to the main content
 */
export const TutorialHighlight = ({ elementSelector, onHighlightClose, isModalOpen }) => {
  const [position, setPosition] = useState(null);
  const highlightRef = useRef(null);

  useEffect(() => {
    const updatePosition = () => {
      if (!elementSelector) {
        setPosition(null);
        return;
      }

      const elements = document.querySelectorAll(elementSelector);
      
      if (elements.length === 0) {
        // Element not found - hide the highlight
        setPosition(null);
        return;
      }

      // Don't check for modals at all - let the highlight show regardless
      // The tutorial overlay has a lower z-index than actual blocking modals anyway

      // Calculate bounding box that encompasses all visible matching elements
      let minTop = Infinity;
      let minLeft = Infinity;
      let maxBottom = -Infinity;
      let maxRight = -Infinity;
      let hasVisibleElement = false;

      elements.forEach(element => {
        const styles = window.getComputedStyle(element);
        // Only consider visible elements
        if (styles.display !== 'none' && styles.visibility !== 'hidden') {
          const rect = element.getBoundingClientRect();
          // Only include elements that are actually in the viewport
          if (rect.width > 0 && rect.height > 0) {
            minTop = Math.min(minTop, rect.top);
            minLeft = Math.min(minLeft, rect.left);
            maxBottom = Math.max(maxBottom, rect.bottom);
            maxRight = Math.max(maxRight, rect.right);
            hasVisibleElement = true;
          }
        }
      });

      if (!hasVisibleElement) {
        setPosition(null);
        return;
      }

      const width = maxRight - minLeft;
      const height = maxBottom - minTop;

      setPosition({
        top: minTop,
        left: minLeft,
        width: width,
        height: height,
      });
    };

    updatePosition();
    
    // Listen to resize and scroll events
    const resizeListener = () => updatePosition();
    const scrollListener = () => updatePosition();
    
    window.addEventListener('resize', resizeListener);
    window.addEventListener('scroll', scrollListener);

    // Also listen for DOM changes in case the view changes
    const mutationObserver = new MutationObserver(() => updatePosition());
    mutationObserver.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'display', 'visibility']
    });

    return () => {
      window.removeEventListener('resize', resizeListener);
      window.removeEventListener('scroll', scrollListener);
      mutationObserver.disconnect();
    };
  }, [elementSelector, isModalOpen]);

  if (!position) return null;

  const padding = 8;

  return (
    <>
      {/* Highlight border only - no dark overlay */}
      <div
        ref={highlightRef}
        className="fixed border-4 border-amber-400 rounded-lg pointer-events-none z-[5000] animate-pulse"
        style={{
          top: position.top - padding,
          left: position.left - padding,
          width: position.width + padding * 2,
          height: position.height + padding * 2,
          boxShadow: '0 0 30px rgba(180, 83, 9, 0.8)',
        }}
      />

      {/* Pointer arrow */}
      <div
        className="fixed bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-sm font-bold z-[5000] animate-bounce"
        style={{
          top: position.top - 40,
          left: position.left + position.width / 2 - 15,
        }}
      >
        ↓ Here!
      </div>
    </>
  );
};
