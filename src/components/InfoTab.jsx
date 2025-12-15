import React, { useState } from 'react';
import { BookOpen, ChevronDown, Play, RotateCcw, X, ChevronLeft } from 'lucide-react';
import { TUTORIAL_LESSONS } from '../data/tutorialLessons';
import { useTutorial } from '../contexts/TutorialContext';
import { TutorialOverlay } from './TutorialOverlay';

/**
 * InfoTab
 * Displays all tutorial lessons and features
 * Users can view lessons, restart tutorials, and explore features
 */
export const InfoTab = ({ onClose, isMobile }) => {
  const [activeTab, setActiveTab] = useState('getting-started'); // 'getting-started' or 'advanced'
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [runningTutorialId, setRunningTutorialId] = useState(null);
  
  const { isTutorialCompleted, restartTutorial, markTutorialCompleted } = useTutorial();

  const onboardingLessons = TUTORIAL_LESSONS.onboarding;
  const featureLessons = TUTORIAL_LESSONS.features;

  const currentLessons = activeTab === 'getting-started' ? onboardingLessons : featureLessons;

  const handleStartTutorial = (lessonId) => {
    setRunningTutorialId(lessonId);
    onClose(); // Close the Help modal when starting tutorial
  };

  const handleRestartTutorial = (lessonId, e) => {
    e.stopPropagation();
    restartTutorial(lessonId);
    setRunningTutorialId(lessonId);
    onClose(); // Close the Help modal when restarting tutorial
  };

  const handleTutorialClose = () => {
    setRunningTutorialId(null);
  };

  const handleTutorialComplete = (lessonId) => {
    setRunningTutorialId(null);
    markTutorialCompleted(lessonId);
  };

  // Lesson Card Component
  const LessonCard = ({ lesson }) => {
    const isCompleted = isTutorialCompleted(lesson.id);
    const isExpanded = expandedLesson === lesson.id;

    return (
      <div
        className={`border-2 rounded-lg overflow-hidden transition cursor-pointer ${
          isExpanded
            ? 'border-primary bg-primary/5'
            : 'border-gray-200 hover:border-primary bg-white'
        }`}
      >
        {/* Header */}
        <div
          onClick={() => setExpandedLesson(isExpanded ? null : lesson.id)}
          className="p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {isCompleted ? (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold">
                  {lesson.steps.length}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 text-lg">{lesson.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-1">{lesson.description}</p>
            </div>
          </div>
          <ChevronDown
            size={24}
            className={`text-gray-400 flex-shrink-0 transition ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
            {/* Lesson Info */}
            <div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {lesson.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {lesson.category}
                </span>
                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full">
                  {lesson.steps.length} steps
                </span>
                {isCompleted && (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    ✓ Completed
                  </span>
                )}
              </div>
            </div>

            {/* Steps */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Lesson Overview:</h4>
              <div className="space-y-2">
                {lesson.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 text-sm">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-black font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{step.title}</p>
                      <p className="text-gray-600 text-xs mt-1">{step.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {isMobile ? (
                <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Desktop Only:</span> Interactive tutorials are available on the desktop version. Visit crittertrack.net on your computer to try them.
                  </p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleStartTutorial(lesson.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition"
                  >
                    <Play size={16} />
                    {isCompleted ? 'Replay' : 'Start'} Tutorial
                  </button>
                  {isCompleted && (
                    <button
                      onClick={(e) => handleRestartTutorial(lesson.id, e)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
                    >
                      <RotateCcw size={16} />
                      Restart
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Full-screen backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={onClose}
      />
      
      {/* Full-screen modal container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <BookOpen size={32} className="text-primary" />
              <div>
                <h2 className="text-3xl font-bold text-gray-800">CritterTrack Tutorials & Help</h2>
                <p className="text-gray-600 text-sm mt-1">Learn all about managing your breeding program</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('getting-started')}
                className={`px-4 py-3 font-semibold transition border-b-4 ${
                  activeTab === 'getting-started'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                🚀 Getting Started
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`px-4 py-3 font-semibold transition border-b-4 ${
                  activeTab === 'advanced'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                ✨ Advanced Features
              </button>
            </div>

            {/* Lesson Cards */}
            <div className="space-y-4">
              {currentLessons.map(lesson => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Running */}
      {runningTutorialId && (
        <TutorialOverlay
          lessonId={runningTutorialId}
          onClose={handleTutorialClose}
          onComplete={handleTutorialComplete}
        />
      )}
    </>
  );
};

export default InfoTab;
