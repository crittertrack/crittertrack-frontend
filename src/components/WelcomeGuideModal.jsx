import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Users, ShoppingBag, HelpCircle, MessageSquare, Loader2, GraduationCap } from 'lucide-react';

const WelcomeGuideModal = ({ onClose }) => {
    const [isClosing, setIsClosing] = useState(false);
    const navigate = useNavigate();

    const handleClose = async () => {
        setIsClosing(true);
        try {
            await onClose();
        } catch (error) {
            console.error('Error closing welcome modal:', error);
            // Close anyway
        }
    };

    // Dismiss (mark as seen, same as the main close button) before navigating to a lesson.
    const goToLesson = async (lessonId) => {
        try {
            await onClose();
        } catch (error) {
            console.error('Error closing welcome modal:', error);
        }
        navigate(lessonId ? `/tutorials?lesson=${encodeURIComponent(lessonId)}` : '/tutorials');
    };

    const TutorialLink = ({ lessonId, children }) => (
        <button
            type="button"
            onClick={() => goToLesson(lessonId)}
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
        >
            <GraduationCap size={13} />
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-accent to-primary text-white p-3 sm:p-4 rounded-t-lg flex-shrink-0">
                    <h2 className="text-lg sm:text-xl font-bold">Welcome to CritterTrack! 🎉</h2>
                    <p className="text-xs sm:text-sm text-white/90">Let's get your profile set up for success</p>
                </div>

                {/* Content - Scrollable */}
                <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
                    {/* Intro */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-2.5 sm:p-3 rounded">
                        <p className="text-xs sm:text-sm text-gray-700">
                            A few essentials worth knowing right away — each links to a full tutorial lesson if you want more detail.
                        </p>
                    </div>

                    {/* Profile Settings - Responsive Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex gap-2 sm:gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-purple-100 rounded-full flex items-center justify-center">
                                    <User className="text-purple-600" size={16} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-0.5 sm:mb-1">Breeder Name & Privacy</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Your <strong>Personal Name</strong> is public by default; your <strong>Breeder Name</strong> is hidden until you turn it on. Both can be shown, hidden, or fully anonymized in Settings → Profile.
                                </p>
                                <TutorialLink lessonId="settings-profile">Settings: Profile</TutorialLink>
                            </div>
                        </div>

                        <div className="flex gap-2 sm:gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-100 rounded-full flex items-center justify-center">
                                    <MapPin className="text-green-600" size={16} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-0.5 sm:mb-1">Country Location</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Set your <strong>Country</strong> in Settings so buyers can filter the Marketplace and Breeder Directory by location.
                                </p>
                                <TutorialLink lessonId="settings-profile">Settings: Profile</TutorialLink>
                            </div>
                        </div>

                        <div className="flex gap-2 sm:gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Users className="text-orange-600" size={16} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-0.5 sm:mb-1">Community Activity</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    The <strong>Community</strong> page shows recently active/new breeders, news, and your favorited animals & breeders in one place.
                                </p>
                                <TutorialLink lessonId="community-overview">Tour the Community page</TutorialLink>
                            </div>
                        </div>

                        <div className="flex gap-2 sm:gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-full flex items-center justify-center">
                                    <ShoppingBag className="text-blue-600" size={16} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-0.5 sm:mb-1">Breeders Registry</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    In Settings → Directory, mark yourself Active/Retired Breeder per species you own to appear in the public <strong>Breeders</strong> registry.
                                </p>
                                <TutorialLink lessonId="settings-directory">Settings: Directory</TutorialLink>
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-lg p-2.5 sm:p-3">
                        <div className="flex gap-2 sm:gap-3 items-start">
                            <div className="flex-shrink-0">
                                <HelpCircle className="text-accent" size={18} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-0.5 sm:mb-1">Need Help Getting Started?</h3>
                                <p className="text-xs text-gray-600">
                                    Step-by-step tutorials are available anytime — open the <strong>Tools</strong> menu (wrench icon) in the top nav and select <strong>Tutorials</strong>.
                                </p>
                                <TutorialLink>Browse all tutorial lessons</TutorialLink>
                            </div>
                        </div>
                    </div>

                    {/* Beta Testing Message */}
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-300 rounded-lg p-2.5 sm:p-3">
                        <div className="flex gap-2 sm:gap-3 items-start">
                            <div className="flex-shrink-0">
                                <MessageSquare className="text-purple-600" size={18} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-0.5 sm:mb-1">🚀 Beta Testing & Your Feedback</h3>
                                <p className="text-xs text-gray-600">
                                    CritterTrack is in <strong>beta</strong>. Click your <strong>profile image circle</strong> and select <strong>Report an Issue</strong> to report bugs or suggest improvements.
                                </p>
                                <TutorialLink lessonId="report-an-issue">How to report an issue</TutorialLink>
                            </div>
                        </div>
                    </div>

                    {/* Action Button - Sticky for mobile */}
                    <div className="flex justify-end pt-2 sm:pt-1 sticky bottom-0 bg-white pb-2 sm:pb-0 sm:static">
                        <button
                            onClick={handleClose}
                            disabled={isClosing}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isClosing ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                'Got it, let\'s get started!'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeGuideModal;
