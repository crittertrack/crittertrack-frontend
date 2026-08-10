import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { TUTORIAL_LESSONS } from '../../data/tutorialLessonsNew';
import { getStepScreenshot, titleToFilename } from '../../data/tutorialScreenshots';
import InfoButton from '../shared/InfoButton';

/**
 * TutorialsPage
 * Simple documentation viewer with screenshots
 * No interactive tutorials - just static guides with images
 */
const TutorialsPage = () => {
  const [expandedSection, setExpandedSection] = useState(TUTORIAL_LESSONS.sections[0]?.id ?? null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [searchParams] = useSearchParams();

  const sections = TUTORIAL_LESSONS.sections;

  // Reset to the first screenshot whenever the step (or lesson) changes
  useEffect(() => {
    setCurrentShotIndex(0);
  }, [selectedLesson, currentStepIndex]);

  // Deep-link support: InfoButton popovers link here via ?lesson=<id> — jump straight to
  // that lesson if it exists yet (lesson content is still being rebuilt, so this is a
  // no-op until matching ids are added back to tutorialLessonsNew.js).
  useEffect(() => {
    const lessonId = searchParams.get('lesson');
    if (!lessonId) return;
    const match = (TUTORIAL_LESSONS.all || []).find(l => l.id === lessonId);
    if (match) {
      setSelectedLesson(match);
      setCurrentStepIndex(0);
      setIsLeftPanelOpen(false);
    }
  }, [searchParams]);


  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const selectLesson = (lesson) => {
    setSelectedLesson(lesson);
    setCurrentStepIndex(0); // Reset to first step when selecting a new lesson
    setIsLeftPanelOpen(false); // Close panel on mobile after selection
  };

  return (
        <div className="w-full h-full bg-white dark:bg-dark-card-bg rounded-xl shadow-lg flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-dark-text flex-shrink-0 bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
                className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-surface-hover rounded-lg transition"
                aria-label="Toggle lesson menu"
              >
                <Menu size={24} className="text-gray-700 dark:text-dark-text" />
              </button>
              <BookOpen size={32} className="text-primary flex-shrink-0" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-dark-text flex items-center gap-2">
                  LESSONS
                  <InfoButton title="Lessons">
                    <p>Step-by-step guides with screenshots covering onboarding, features, and advanced workflows. Pick a lesson from the list to get started.</p>
                  </InfoButton>
                </h2>
                <p className="text-gray-600 dark:text-dark-text-secondary text-xs sm:text-sm mt-1">Browse tutorials and guides</p>
              </div>
            </div>
          </div>

          {/* Main Content: Sidebar + Details */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Sidebar - Lesson List (collapsible on mobile) */}
            <div className={`${
              isLeftPanelOpen ? 'absolute sm:relative inset-0 z-10' : 'hidden'
            } sm:block w-full sm:w-80 md:w-96 border-r border-gray-200 dark:border-dark-text overflow-y-auto bg-gray-50 dark:bg-dark-card-bg`}>

              {sections.map((section) => (
                <div key={section.id} className="border-b border-gray-300 dark:border-dark-text">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-white dark:bg-dark-card-bg hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition font-semibold text-gray-800 dark:text-dark-text text-left"
                  >
                    <span className="text-sm sm:text-base">{section.label}</span>
                    {expandedSection === section.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedSection === section.id && (
                    <div className="bg-gray-50 dark:bg-dark-card-bg">
                      {section.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => selectLesson(lesson)}
                          className={`w-full px-6 py-2.5 text-left text-sm hover:bg-blue-50 dark:hover:bg-dark-surface-hover transition ${
                            selectedLesson?.id === lesson.id ? 'bg-blue-100 dark:bg-dark-primary/20 text-blue-800 dark:text-dark-primary font-semibold border-l-4 border-blue-600 dark:border-dark-primary' : 'text-gray-700 dark:text-dark-text-secondary'
                          }`}
                        >
                          {lesson.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side - Lesson Details */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-dark-card-bg">
              {selectedLesson ? (
                <div className="max-w-7xl mx-auto">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setIsLeftPanelOpen(true)}
                    className="sm:hidden flex items-center gap-2 mb-4 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition"
                  >
                    <ChevronLeft size={16} />
                    Back to Lessons
                  </button>

                  {/* Lesson Title */}
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-dark-text mb-3">
                    {selectedLesson.title}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-gray-600 dark:text-dark-text-secondary text-sm sm:text-base mb-6 leading-relaxed">
                    {selectedLesson.description}
                  </p>

                  {/* Steps with Screenshots - Paginated */}
                  {(() => {
                    const currentStep = selectedLesson.steps[currentStepIndex];
                    const totalSteps = selectedLesson.steps.length;
                    const currentSection = sections.find(s => s.lessons.some(l => l.id === selectedLesson.id));
                    const stepNumber = currentStep.stepNumber || currentStepIndex + 1;
                    // Most steps have one screenshot; a step can opt into more via `screenshotCount`
                    // in tutorialLessonsNew.js (resolved as filename, filename-2, filename-3, ...).
                    const screenshots = Array.from({ length: currentStep.screenshotCount || 1 }, (_, i) => {
                      const variant = i + 1;
                      const filename = titleToFilename(currentStep.title) + (variant > 1 ? `-${variant}` : '') + '.png';
                      return {
                        url: getStepScreenshot(currentSection?.id, selectedLesson.id, stepNumber, currentStep.title, variant),
                        filename,
                        suggestedPath: `/images/tutorials/${currentSection?.id || 'unknown-tour'}/${filename}`,
                      };
                    });
                    // Clamp in case the step changed to one with fewer screenshots before the reset effect runs
                    const safeShotIndex = Math.min(currentShotIndex, screenshots.length - 1);

                    return (
                      <div className="space-y-4">
                        {/* Step Progress Indicator */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-semibold text-gray-600 dark:text-dark-text-secondary">
                            Step {currentStepIndex + 1} of {totalSteps}
                          </span>
                          <div className="flex gap-1">
                            {selectedLesson.steps.map((_, index) => (
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

                        {/* Current Step */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-surface dark:to-dark-surface rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-dark-text">
                          {/* Step Header */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-black font-bold flex items-center justify-center text-sm shadow-md">
                              {currentStepIndex + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 dark:text-dark-text text-lg">{currentStep.title}</h3>
                              <p className="text-gray-600 dark:text-dark-text-secondary text-sm mt-1">{currentStep.content}</p>
                            </div>
                          </div>

                          {/* Screenshot(s) */}
                          <div className="mt-4">
                            {screenshots.length > 1 && (
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-500 dark:text-dark-text-secondary">
                                  Image {safeShotIndex + 1} of {screenshots.length}
                                </span>
                                <div className="flex gap-1">
                                  {screenshots.map((_, shotIndex) => (
                                    <button
                                      key={shotIndex}
                                      onClick={() => setCurrentShotIndex(shotIndex)}
                                      aria-label={`Show image ${shotIndex + 1}`}
                                      className={`h-2 w-2 rounded-full transition-all ${
                                        shotIndex === safeShotIndex ? 'bg-primary w-6' : 'bg-gray-300 hover:bg-gray-400'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="relative">
                              {(() => {
                                const shot = screenshots[safeShotIndex];
                                return shot.url ? (
                                  <div className="rounded-lg overflow-hidden border-2 border-gray-300 shadow-sm">
                                    <img
                                      src={shot.url}
                                      alt={`Screenshot: ${currentStep.title}${screenshots.length > 1 ? ` (${safeShotIndex + 1})` : ''}`}
                                      className="w-full h-auto"
                                      onError={(e) => {
                                        // If image fails to load, show placeholder
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                      }}
                                    />
                                    <div className="hidden bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-lg p-8 items-center justify-center">
                                      <div className="text-center">
                                        <div className="text-4xl mb-2">📸</div>
                                        <p className="text-gray-500 text-sm font-medium">Screenshot: {shot.filename}</p>
                                        <p className="text-gray-400 text-xs mt-1">Image not found</p>
                                        <p className="text-gray-400 text-xs mt-1 font-mono">Save to: {shot.suggestedPath}</p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-lg p-8 flex items-center justify-center">
                                    <div className="text-center">
                                      <div className="text-4xl mb-2">📸</div>
                                      <p className="text-gray-500 text-sm font-medium">Screenshot: {shot.filename}</p>
                                      <p className="text-gray-400 text-xs mt-1">Visual guide coming soon</p>
                                      <p className="text-gray-400 text-xs mt-1 font-mono">Save to: {shot.suggestedPath}</p>
                                    </div>
                                  </div>
                                );
                              })()}
                              {screenshots.length > 1 && (
                                <>
                                  <button
                                    onClick={() => setCurrentShotIndex(prev => (prev === 0 ? screenshots.length - 1 : prev - 1))}
                                    aria-label="Previous image"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-dark-card-bg/80 border border-gray-300 dark:border-dark-text shadow hover:bg-white dark:hover:bg-dark-card-bg transition"
                                  >
                                    <ChevronLeft size={18} />
                                  </button>
                                  <button
                                    onClick={() => setCurrentShotIndex(prev => (prev === screenshots.length - 1 ? 0 : prev + 1))}
                                    aria-label="Next image"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-dark-card-bg/80 border border-gray-300 dark:border-dark-text shadow hover:bg-white dark:hover:bg-dark-card-bg transition"
                                  >
                                    <ChevronRight size={18} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex items-center justify-center gap-4 mt-6">
                          <button
                            onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentStepIndex === 0}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed bg-white dark:bg-dark-card-bg dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface-hover border-2 border-gray-300 dark:border-dark-text disabled:hover:bg-white dark:disabled:hover:bg-dark-card-bg"
                            aria-label="Previous step"
                          >
                            <ChevronLeft size={20} />
                            <span className="hidden sm:inline">Previous</span>
                          </button>

                          <button
                            onClick={() => setCurrentStepIndex(prev => Math.min(totalSteps - 1, prev + 1))}
                            disabled={currentStepIndex === totalSteps - 1}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed bg-primary dark:bg-dark-primary hover:bg-primary/90 text-black border-2 border-primary disabled:hover:bg-primary"
                            aria-label="Next step"
                          >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Footer Note */}
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> These guides will help you learn CritterTrack at your own pace. Take your time exploring each feature!
                    </p>
                  </div>
                </div>
              ) : (
                // No lesson selected
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-400 dark:text-dark-text-muted">
                    <BookOpen size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Coming Soon</p>
                    <p className="text-sm mt-2">Tutorials and guides are being reworked — check back soon!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
  );
};

export default TutorialsPage;
