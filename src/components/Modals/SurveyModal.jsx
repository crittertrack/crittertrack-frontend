import React, { useState } from 'react';
import { X, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import axios from 'axios';

const SurveyModal = ({ onClose, surveyResponses, setSurveyResponses, setSurveySubmitting, surveySubmitting }) => {
    const [currentPage, setCurrentPage] = useState(0); // 0 = intro, 1-3 = questions, 4 = thank you
    const [submitError, setSubmitError] = useState('');
    const [expandedOther, setExpandedOther] = useState(null); // For Q3 and Q4 "Other" fields

    const QUESTIONS_PER_PAGE = 5;
    const QUESTIONS = [
        {
            id: 'q1_overall_satisfaction',
            title: 'How satisfied are you with the overall experience of the website?',
            type: 'scale',
            labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied']
        },
        {
            id: 'q2_visual_design',
            title: "How satisfied are you with the website's visual design, layout, and use of icons?",
            type: 'scale',
            labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied']
        },
        {
            id: 'q3_primary_use',
            title: 'What do you use the website most for?',
            type: 'multicheck',
            options: [
                'Keeping track of my owned animals',
                'Viewing pedigrees and family trees',
                'Finding other breeders and/or available animals',
                'Managing litters and breeding events',
                'Recording animal status, transfers, or ownership',
                'Other (please specify)'
            ]
        },
        {
            id: 'q4_features_used',
            title: 'Which features do you use most often?',
            type: 'multicheck',
            options: [
                'My Animals Features (List/Collections/Enclosures etc.)',
                'My Feed (Active/Favorites)',
                'Litter Management (Base View or Calendar)',
                'Global Calendar',
                'Budget',
                'Available Animals',
                'Genetics Calculator',
                'Breeders Registry',
                'Global Search'
            ]
        },
        {
            id: 'q5_find_animals',
            title: 'How easy is it to find and access your animals and animal records? (add/edit/view)',
            type: 'scale',
            labels: ['Very Difficult', 'Difficult', 'Neutral', 'Easy', 'Very Easy']
        },
        {
            id: 'q6_litter_family_tree',
            title: 'How easy is it to find and access litter tracking and family tree information?',
            type: 'scale',
            labels: ['Very Difficult', 'Difficult', 'Neutral', 'Easy', 'Very Easy']
        },
        {
            id: 'q7_genetics_tools',
            title: 'How useful do you find the genetics calculator and breeding line tools?',
            type: 'scale',
            labels: ['Not Useful', 'Slightly Useful', 'Moderately Useful', 'Useful', 'Very Useful']
        },
        {
            id: 'q8_animal_profile_clarity',
            title: 'How clear is the animal profile page layout and information?',
            type: 'scale',
            labels: ['Very Unclear', 'Unclear', 'Neutral', 'Clear', 'Very Clear']
        },
        {
            id: 'q9_litter_tracking',
            title: 'How well does the website support tracking litters and breeding events?',
            type: 'scale',
            labels: ['Not Well', 'Somewhat', 'Neutral', 'Well', 'Very Well']
        },
        {
            id: 'q10_ownership_management',
            title: 'How well does the website support managing animal ownership, transfers, and status updates?',
            type: 'scale',
            labels: ['Not Well', 'Somewhat', 'Neutral', 'Well', 'Very Well']
        },
        {
            id: 'q11_profile_settings',
            title: 'How easy is it to manage your own profile and account settings?',
            type: 'scale',
            labels: ['Very Hard', 'Hard', 'Neutral', 'Easy', 'Very Easy']
        },
        {
            id: 'q12_breeder_directory',
            title: 'How helpful is the breeder directory/community section?',
            type: 'scale',
            labels: ['Not Helpful', 'Slightly Helpful', 'Moderately Helpful', 'Helpful', 'Very Helpful']
        },
        {
            id: 'q13_visibility_comfort',
            title: 'How comfortable are you with how public animal/profile visibility is handled?',
            type: 'scale',
            labels: ['Very Uncomfortable', 'Uncomfortable', 'Neutral', 'Comfortable', 'Very Comfortable']
        },
        {
            id: 'q14_marketplace_utility',
            title: 'How useful is the marketplace section for finding available animals?',
            type: 'scale',
            labels: ['Not Useful', 'Slightly Useful', 'Moderately Useful', 'Useful', 'Very Useful']
        },
        {
            id: 'q15_improvements',
            title: 'What improvements would make this website more useful/accessible for you?',
            type: 'text',
            maxLength: 1000
        }
    ];

    const getPageQuestions = () => {
        if (currentPage === 0) return [];
        const startIdx = (currentPage - 1) * QUESTIONS_PER_PAGE;
        const endIdx = Math.min(startIdx + QUESTIONS_PER_PAGE, QUESTIONS.length);
        return QUESTIONS.slice(startIdx, endIdx);
    };

    const totalPages = Math.ceil(QUESTIONS.length / QUESTIONS_PER_PAGE);

    const isPageComplete = () => {
        const questions = getPageQuestions();
        for (const question of questions) {
            const value = surveyResponses[question.id];
            if (question.type === 'scale' && !value) return false;
            if (question.type === 'multicheck' && (!Array.isArray(value) || value.length === 0)) return false;
            if (question.type === 'text' && (question.id === 'q3_primary_use' || question.id === 'q4_features_used')) {
                // Skip required check for "Other" text fields
                continue;
            }
        }
        return true;
    };

    const handleScaleChange = (questionId, value) => {
        setSurveyResponses(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleMulticheckChange = (questionId, option) => {
        setSurveyResponses(prev => {
            const current = Array.isArray(prev[questionId]) ? prev[questionId] : [];
            if (current.includes(option)) {
                return {
                    ...prev,
                    [questionId]: current.filter(item => item !== option)
                };
            } else {
                return {
                    ...prev,
                    [questionId]: [...current, option]
                };
            }
        });
    };

    const handleTextChange = (questionId, value) => {
        setSurveyResponses(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            setSubmitError('');
            setSurveySubmitting(true);

            // Validate all responses
            for (const question of QUESTIONS) {
                const value = surveyResponses[question.id];
                if (question.type === 'scale' && !value) {
                    setSubmitError(`Please answer all scale questions`);
                    setSurveySubmitting(false);
                    return;
                }
                if (question.type === 'multicheck' && (!Array.isArray(value) || value.length === 0)) {
                    setSubmitError(`Please select at least one option for "${question.title}"`);
                    setSurveySubmitting(false);
                    return;
                }
            }

            // Submit to backend
            const response = await axios.post('/api/surveys/beta-survey', surveyResponses);

            if (response.status === 201) {
                setCurrentPage(4); // Go to thank you page
                setTimeout(() => {
                    setSurveySubmitting(false);
                    setTimeout(() => onClose(), 2000);
                }, 1000);
            }
        } catch (error) {
            console.error('Error submitting survey:', error);
            setSubmitError(error.response?.data?.error || 'Failed to submit survey. Please try again.');
            setSurveySubmitting(false);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (isPageComplete() && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Intro Page
    if (currentPage === 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 sm:p-6 rounded-t-lg flex-shrink-0 flex items-center justify-between">
                        <h2 className="text-lg sm:text-2xl font-bold">Survey Introduction</h2>
                        <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1 transition">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
                        <div className="space-y-3">
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                Thank you for taking a few minutes to share your feedback. This survey is designed to help me understand 
                                how well the website supports breeders and animal managers, including animal records, litter tracking, 
                                genetics tools, and community features. Your responses will guide improvements to make the site easier to use, 
                                more useful, and better aligned with all your needs.
                            </p>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded">
                            <p className="text-xs sm:text-sm text-gray-700">
                                <strong>Total questions: {QUESTIONS.length}</strong> | Estimated time: 3-5 minutes
                            </p>
                        </div>

                        <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 rounded">
                            <p className="text-xs sm:text-sm text-gray-700">
                                ✓ All of your responses are valuable and will be saved with your account information (username and CTUID)
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t bg-gray-50 p-4 sm:p-6 rounded-b-lg flex-shrink-0 flex gap-2 sm:gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 sm:px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setCurrentPage(1)}
                            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-2"
                        >
                            <span>Start</span>
                            <span>→</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Thank You Page
    if (currentPage === 4) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Thank You!</h2>
                    <p className="text-gray-600 mb-6">Your survey has been submitted successfully. Your feedback is invaluable to us!</p>
                    <p className="text-sm text-gray-500">Closing automatically...</p>
                </div>
            </div>
        );
    }

    // Questions Pages
    const questions = getPageQuestions();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 sm:p-6 rounded-t-lg flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg sm:text-xl font-bold">Survey Questions</h2>
                        <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1 transition">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="mt-3 bg-white/20 rounded-full h-2">
                        <div 
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentPage / totalPages) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs sm:text-sm text-white/80 mt-2">
                        Page {currentPage} of {totalPages}
                    </p>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
                    {submitError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-xs sm:text-sm">
                            {submitError}
                        </div>
                    )}

                    {questions.map((question, idx) => (
                        <div key={question.id} className="border-b pb-4 sm:pb-6 last:border-b-0">
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-3">
                                {(currentPage - 1) * QUESTIONS_PER_PAGE + idx + 1}. {question.title}
                            </h3>

                            {/* Scale Response */}
                            {question.type === 'scale' && (
                                <>
                                <div className="grid grid-cols-5 gap-1 sm:gap-2">
                                    {question.labels.map((label, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1">
                                            <button
                                                onClick={() => handleScaleChange(question.id, i + 1)}
                                                className={`w-full aspect-square rounded-lg border-2 font-bold text-xs sm:text-sm transition ${
                                                    surveyResponses[question.id] === i + 1
                                                        ? 'bg-blue-600 border-blue-600 text-white'
                                                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-blue-400'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                            <span className="text-xs text-gray-600 text-center leading-tight hidden sm:block">
                                                {label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 mt-2 sm:hidden text-xs text-gray-500">
                                    <span>← {question.labels[0]}</span>
                                    <span className="ml-auto">{question.labels[4]} →</span>
                                </div>
                                </>
                            )}

                            {/* Multiple Choice Response */}
                            {question.type === 'multicheck' && (
                                <div className="space-y-2">
                                    {question.options.map((option, optIdx) => {
                                        const isOther = option.includes('Other');
                                        const fieldKey = `${question.id}_other_${optIdx}`;
                                        
                                        return (
                                            <div key={optIdx} className="space-y-1">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={surveyResponses[question.id]?.includes(option) || false}
                                                        onChange={() => handleMulticheckChange(question.id, option)}
                                                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                                                    />
                                                    <span className="text-xs sm:text-sm text-gray-700">{option}</span>
                                                </label>
                                                {isOther && surveyResponses[question.id]?.includes(option) && (
                                                    <input
                                                        type="text"
                                                        placeholder="Please specify..."
                                                        maxLength="200"
                                                        value={surveyResponses[fieldKey] || ''}
                                                        onChange={(e) => handleTextChange(fieldKey, e.target.value)}
                                                        className="ml-7 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none w-full"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Text Response */}
                            {question.type === 'text' && (
                                <textarea
                                    value={surveyResponses[question.id] || ''}
                                    onChange={(e) => handleTextChange(question.id, e.target.value.slice(0, question.maxLength))}
                                    maxLength={question.maxLength}
                                    placeholder="Your feedback here..."
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none resize-vertical min-h-[120px]"
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="border-t bg-gray-50 p-4 sm:p-6 rounded-b-lg flex-shrink-0 flex gap-2 sm:gap-3 justify-between">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="px-4 sm:px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                        <ChevronUp size={16} />
                        <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="text-xs sm:text-sm text-gray-600 flex items-center">
                        {currentPage < totalPages
                            ? `${isPageComplete() ? '✓ Complete' : 'Complete this page to continue'}`
                            : '✓ All questions answered'
                        }
                    </div>

                    {currentPage < totalPages ? (
                        <button
                            onClick={handleNextPage}
                            disabled={!isPageComplete()}
                            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronDown size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={surveySubmitting}
                            className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {surveySubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="hidden sm:inline">Submitting...</span>
                                </>
                            ) : (
                                'Submit Survey'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SurveyModal;
