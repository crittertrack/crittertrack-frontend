import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check, BookOpen } from 'lucide-react';
import { TUTORIAL_LESSONS } from '../data/tutorialLessons';
import { useTutorial } from '../contexts/TutorialContext';

/**
 * TutorialOverlay
 * Main modal component that shows tutorial lessons with navigation
 */
export const TutorialOverlay = React.forwardRef(({ lessonId, onClose, onComplete, onStepChange }, ref) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { markTutorialCompleted } = useTutorial();

  const lesson = TUTORIAL_LESSONS.onboarding.find(l => l.id === lessonId) || 
                 TUTORIAL_LESSONS.features.find(l => l.id === lessonId);

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

  // Reset step index when lesson changes
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [lessonId]);

  const handleComplete = useCallback(() => {
    if (lesson) {
      markTutorialCompleted(lesson.id);
    }
    if (onComplete) {
      onComplete(lesson?.id);
    }
    // Don't call onClose here - let the parent component handle closing
    // onClose will be called by parent when all lessons are done
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
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  if (!lesson || !currentStep) return null;

  const progress = ((currentStepIndex + 1) / lesson.steps.length) * 100;

  return (
    <>
      {/* Tutorial Panel - floating on the side */}
      <div className="fixed top-6 left-6 w-96 bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-[9999]">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-black p-4 flex justify-between items-start flex-shrink-0">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} />
              <span className="text-xs font-semibold opacity-80">Lesson {TUTORIAL_LESSONS.onboarding.findIndex(l => l.id === lessonId) + 1} of {TUTORIAL_LESSONS.onboarding.length}</span>
            </div>
            <h2 className="text-lg font-bold">{lesson.title}</h2>
          </div>
          <button
            onClick={handleSkip}
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
          {currentStep.highlightElement && (
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
          </div>
        </div>
      </div>
    </>
  );
});

TutorialOverlay.displayName = 'TutorialOverlay';

/**
 * InitialTutorialModal
 * Welcome screen for new users - lets them choose to start tutorial or skip
 */
export const InitialTutorialModal = ({ onStart, onSkip }) => {
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
            💡 <strong>Tip:</strong> You can always access tutorials later from the Info tab at any time.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 flex items-center justify-end gap-3 flex-shrink-0">
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

      const element = document.querySelector(elementSelector);
      if (!element) {
        // Element not found - hide the highlight
        setPosition(null);
        return;
      }

      // Get the element's position
      const rect = element.getBoundingClientRect();
      
      // Check if element is covered by a modal overlay (but exclude the tutorial panel itself)
      const allFixed = document.querySelectorAll('[class*="fixed"]');
      let maxModalZIndex = 0;
      let maxElementZIndex = 9998; // Our highlight z-index
      
      for (const el of allFixed) {
        // Skip the tutorial panel itself
        if (el.classList.contains('bg-gradient-to-r') && el.classList.contains('shadow-2xl')) {
          continue; // This is the tutorial panel, skip it
        }
        
        const zIndex = window.getComputedStyle(el).zIndex;
        const classes = el.className;
        // Check if this looks like a modal (has bg-black, bg-white, or similar overlay classes)
        if ((classes.includes('bg-black') || classes.includes('bg-white')) && !isNaN(zIndex) && zIndex !== 'auto') {
          maxModalZIndex = Math.max(maxModalZIndex, parseInt(zIndex));
        }
      }

      // If there's a modal with higher z-index than our highlight, don't show highlight
      if (maxModalZIndex > maxElementZIndex) {
        setPosition(null);
        return;
      }

      setPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
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
      attributeFilter: ['class', 'style', 'zindex']
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
        className="fixed border-4 border-amber-400 rounded-lg pointer-events-none z-[9998] animate-pulse"
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
        className="fixed bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-sm font-bold z-[9998] animate-bounce"
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
