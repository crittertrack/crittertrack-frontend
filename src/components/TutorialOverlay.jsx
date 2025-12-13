import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check, BookOpen } from 'lucide-react';
import { TUTORIAL_LESSONS } from '../data/tutorialLessons';
import { useTutorial } from '../contexts/TutorialContext';

/**
 * TutorialOverlay
 * Main modal component that shows tutorial lessons with navigation
 */
export const TutorialOverlay = ({ lessonId, onClose, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { markTutorialCompleted } = useTutorial();

  const lesson = TUTORIAL_LESSONS.onboarding.find(l => l.id === lessonId) || 
                 TUTORIAL_LESSONS.features.find(l => l.id === lessonId);

  const currentStep = lesson?.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = lesson ? currentStepIndex === lesson.steps.length - 1 : false;

  const handleComplete = useCallback(() => {
    console.log('handleComplete called for lesson:', lesson?.id);
    if (lesson) {
      markTutorialCompleted(lesson.id);
    }
    if (onComplete) {
      console.log('Calling onComplete with lessonId:', lesson?.id);
      onComplete(lesson?.id);
    }
    if (onClose) {
      console.log('Calling onClose');
      onClose();
    }
  }, [lesson, markTutorialCompleted, onComplete, onClose]);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-black p-6 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={20} />
              <span className="text-sm font-semibold opacity-80">Tutorial: Lesson {TUTORIAL_LESSONS.onboarding.findIndex(l => l.id === lessonId) + 1} of {TUTORIAL_LESSONS.onboarding.length}</span>
            </div>
            <h2 className="text-2xl font-bold">{lesson.title}</h2>
            <p className="text-sm opacity-80 mt-1">{lesson.description}</p>
          </div>
          <button
            onClick={handleSkip}
            className="text-black/50 hover:text-black transition p-2 rounded-lg hover:bg-white/20"
            title="Close tutorial"
          >
            <X size={24} />
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
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Step Counter */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">
              Step {currentStepIndex + 1} of {lesson.steps.length}
            </span>
            <div className="flex gap-1">
              {lesson.steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentStepIndex ? 'bg-primary w-6' : 
                    index < currentStepIndex ? 'bg-accent' :
                    'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Title */}
          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              {currentStep.title}
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              {currentStep.content}
            </p>
          </div>

          {/* Tips */}
          {currentStep.tips && currentStep.tips.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
              <h4 className="text-sm font-bold text-blue-900 mb-2">💡 Tips:</h4>
              <ul className="space-y-2">
                {currentStep.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-blue-800 flex gap-2">
                    <span className="text-blue-400 flex-shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Highlighted element indicator */}
          {currentStep.highlightElement && (
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                ✨ <strong>Look for the highlighted element on the screen →</strong>
              </p>
            </div>
          )}
        </div>

        {/* Footer with Navigation */}
        <div className="border-t border-gray-200 bg-gray-50 p-6 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white"
          >
            <ChevronLeft size={20} />
            <span className="font-semibold">Previous</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-semibold transition hover:bg-white rounded-lg"
            >
              Skip Tutorial
            </button>

            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition ${
                isLastStep
                  ? 'bg-accent hover:bg-accent/90 text-white'
                  : 'bg-primary hover:bg-primary/90 text-black'
              }`}
            >
              {isLastStep ? (
                <>
                  <Check size={20} />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

/**
 * TutorialHighlight
 * Highlights a specific element on the screen and shows a pointer
 * Should be rendered as an overlay to the main content
 */
export const TutorialHighlight = ({ elementSelector, onHighlightClose }) => {
  const [position, setPosition] = useState(null);
  const highlightRef = useRef(null);

  useEffect(() => {
    const updatePosition = () => {
      if (!elementSelector) return;

      const element = document.querySelector(elementSelector);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [elementSelector]);

  if (!position) return null;

  const padding = 8;

  return (
    <>
      {/* Overlay background */}
      <div 
        className="fixed inset-0 bg-black/40 z-[9998]"
        style={{
          boxShadow: `inset 0 0 0 9999px rgba(0, 0, 0, 0.4)`,
          clipPath: `polygon(
            0% 0%,
            0% 100%,
            100% 100%,
            100% 0%,
            0% 0%,
            ${position.left - padding}px ${position.top - padding}px,
            ${position.left - padding}px ${position.top + position.height + padding}px,
            ${position.left + position.width + padding}px ${position.top + position.height + padding}px,
            ${position.left + position.width + padding}px ${position.top - padding}px,
            ${position.left - padding}px ${position.top - padding}px
          )`
        }}
        onClick={onHighlightClose}
      />

      {/* Highlight border */}
      <div
        ref={highlightRef}
        className="fixed border-4 border-accent rounded-lg pointer-events-none z-[9998] animate-pulse"
        style={{
          top: position.top - padding,
          left: position.left - padding,
          width: position.width + padding * 2,
          height: position.height + padding * 2,
          boxShadow: '0 0 30px rgba(249, 115, 22, 0.8)',
        }}
      />

      {/* Pointer arrow */}
      <div
        className="fixed bg-accent text-white px-3 py-1 rounded-full text-sm font-bold z-[9998] animate-bounce"
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
