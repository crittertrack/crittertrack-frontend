import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

const BetaFeedbackModal = ({ onClose, onStartSurvey }) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = async () => {
        setIsClosing(true);
        if (dontShowAgain) {
            // Store in localStorage with user ID key (will be set by parent)
            const storageKey = localStorage.getItem('betaFeedbackModalUserId');
            if (storageKey) {
                localStorage.setItem(`${storageKey}_dontShowBetaFeedback`, 'true');
            }
        }
        try {
            await onClose();
        } catch (error) {
            console.error('Error closing beta feedback modal:', error);
        }
    };

    const handleStartSurvey = async () => {
        setIsClosing(true);
        if (dontShowAgain) {
            const storageKey = localStorage.getItem('betaFeedbackModalUserId');
            if (storageKey) {
                localStorage.setItem(`${storageKey}_dontShowBetaFeedback`, 'true');
            }
        }
        try {
            await onStartSurvey();
        } catch (error) {
            console.error('Error starting survey:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 sm:p-6 rounded-t-lg flex-shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Sparkles size={24} className="text-yellow-300" />
                        <h2 className="text-lg sm:text-2xl font-bold">Beta Finishing Soon</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isClosing}
                        className="text-white hover:bg-white/20 rounded-lg p-1 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
                    {/* Introduction */}
                    <div className="space-y-3">
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                            CritterTrack is approaching the end of its beta phase! We've been working hard to build a platform 
                            that serves breeders and animal managers effectively. As we move toward a stable release, we'd love 
                            to hear from you about your experience.
                        </p>
                    </div>

                    {/* Why We Need Feedback */}
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-3 sm:p-4 rounded">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-2">Why Your Feedback Matters</h3>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                            Your insights help us understand what's working well and what needs improvement. We want to make sure 
                            the website supports your needs for managing animal records, tracking litters, using genetics tools, 
                            and connecting with other breeders.
                        </p>
                    </div>

                    {/* What We're Looking For */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">In This Survey, We'd Like to Know:</h3>
                        <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                            <li className="flex gap-2">
                                <span className="text-purple-600 font-bold">✓</span>
                                <span>How satisfied you are with the overall experience and design</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-purple-600 font-bold">✓</span>
                                <span>Which features you use most and find most valuable</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-purple-600 font-bold">✓</span>
                                <span>How easy it is to manage your animals, litters, and breeding activities</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-purple-600 font-bold">✓</span>
                                <span>What improvements would make the platform more useful for you</span>
                            </li>
                        </ul>
                    </div>

                    {/* Time Estimate */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded">
                        <p className="text-xs sm:text-sm text-gray-700">
                            <span className="font-semibold">⏱️ Takes about 3-5 minutes</span> to complete the survey.
                        </p>
                    </div>

                    {/* Do Not Show Again Checkbox */}
                    <div className="flex items-center gap-3 pt-2">
                        <input
                            type="checkbox"
                            id="dontShowAgain"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            disabled={isClosing}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded cursor-pointer disabled:opacity-50"
                        />
                        <label htmlFor="dontShowAgain" className="text-xs sm:text-sm text-gray-700 cursor-pointer">
                            Don't show this again
                        </label>
                    </div>
                </div>

                {/* Footer with Buttons */}
                <div className="border-t bg-gray-50 p-4 sm:p-6 rounded-b-lg flex-shrink-0 flex gap-2 sm:gap-3 justify-end">
                    <button
                        onClick={handleClose}
                        disabled={isClosing}
                        className="px-4 sm:px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium text-sm disabled:opacity-50"
                    >
                        Not Now
                    </button>
                    <button
                        onClick={handleStartSurvey}
                        disabled={isClosing}
                        className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        <span>Start Survey</span>
                        <span>→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BetaFeedbackModal;
