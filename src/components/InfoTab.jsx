import React, { useState } from 'react';
import { BookOpen, X, ChevronDown, ChevronUp } from 'lucide-react';
import { TUTORIAL_LESSONS } from '../data/tutorialLessonsNew';

/**
 * InfoTab (Help/Lessons)
 * Simple documentation viewer with screenshots
 * No interactive tutorials - just static guides with images
 */
export const InfoTab = ({ onClose }) => {
  const [expandedSection, setExpandedSection] = useState('getting-started');
  const [selectedLesson, setSelectedLesson] = useState(null);

  const onboardingLessons = TUTORIAL_LESSONS.onboarding;
  const featureLessons = TUTORIAL_LESSONS.features;
  const advancedLessons = TUTORIAL_LESSONS.advanced;

  const onboardingLessons = TUTORIAL_LESSONS.onboarding;
  const featureLessons = TUTORIAL_LESSONS.features;
  const advancedLessons = TUTORIAL_LESSONS.advanced;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const selectLesson = (lesson) => {
    setSelectedLesson(lesson);
  };

  return (
    <>
      {/* Full-screen backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998]"
        onClick={onClose}
      />
      
      {/* Full-screen modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="w-full max-w-7xl h-full max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="flex items-center gap-3">
              <BookOpen size={32} className="text-primary flex-shrink-0" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">LESSONS</h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">Browse tutorials and guides</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* Main Content: Sidebar + Details */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Lesson List */}
            <div className="w-full sm:w-80 md:w-96 border-r border-gray-200 overflow-y-auto bg-gray-50">
              
              {/* Getting Started Section */}
              <div className="border-b border-gray-300">
                <button
                  onClick={() => toggleSection('getting-started')}
                  className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition font-semibold text-gray-800 text-left"
                >
                  <span className="text-sm sm:text-base">🚀 Getting Started</span>
                  {expandedSection === 'getting-started' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {expandedSection === 'getting-started' && (
                  <div className="bg-gray-50">
                    {onboardingLessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        className={`w-full px-6 py-2.5 text-left text-sm hover:bg-blue-50 transition ${
                          selectedLesson?.id === lesson.id ? 'bg-blue-100 text-blue-800 font-semibold border-l-4 border-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {lesson.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Key Features Section */}
              <div className="border-b border-gray-300">
                <button
                  onClick={() => toggleSection('key-features')}
                  className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition font-semibold text-gray-800 text-left"
                >
                  <span className="text-sm sm:text-base">📋 Key Features</span>
                  {expandedSection === 'key-features' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {expandedSection === 'key-features' && (
                  <div className="bg-gray-50">
                    {featureLessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        className={`w-full px-6 py-2.5 text-left text-sm hover:bg-blue-50 transition ${
                          selectedLesson?.id === lesson.id ? 'bg-blue-100 text-blue-800 font-semibold border-l-4 border-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {lesson.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced Features Section */}
              <div className="border-b border-gray-300">
                <button
                  onClick={() => toggleSection('advanced')}
                  className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition font-semibold text-gray-800 text-left"
                >
                  <span className="text-sm sm:text-base">✨ Advanced Features</span>
                  {expandedSection === 'advanced' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {expandedSection === 'advanced' && (
                  <div className="bg-gray-50">
                    {advancedLessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        className={`w-full px-6 py-2.5 text-left text-sm hover:bg-blue-50 transition ${
                          selectedLesson?.id === lesson.id ? 'bg-blue-100 text-blue-800 font-semibold border-l-4 border-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {lesson.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Lesson Details */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
              {selectedLesson ? (
                <div className="max-w-4xl mx-auto">
                  {/* Lesson Title */}
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                    {selectedLesson.title}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">
                    {selectedLesson.description}
                  </p>

                  {/* Steps with Screenshots */}
                  <div className="space-y-6">
                    {(selectedLesson.steps || []).map((step, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 sm:p-6 border border-gray-200">
                        {/* Step Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-black font-bold flex items-center justify-center text-sm shadow-md">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-lg">{step.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{step.content}</p>
                          </div>
                        </div>

                        {/* Screenshot Placeholder */}
                        <div className="mt-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-lg p-8 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📸</div>
                            <p className="text-gray-500 text-sm font-medium">Screenshot: {step.title}</p>
                            <p className="text-gray-400 text-xs mt-1">Visual guide coming soon</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

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
                  <div className="text-center text-gray-400">
                    <BookOpen size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Select a lesson to get started</p>
                    <p className="text-sm mt-2">Choose from Getting Started, Key Features, or Advanced Features</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoTab;
