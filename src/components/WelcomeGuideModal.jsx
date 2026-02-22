import React, { useState } from 'react';
import { User, MapPin, Users, ShoppingBag, HelpCircle, MessageSquare, Loader2 } from 'lucide-react';

const WelcomeGuideModal = ({ onClose }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = async () => {
        setIsClosing(true);
        try {
            await onClose();
        } catch (error) {
            console.error('Error closing welcome modal:', error);
            // Close anyway
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-accent to-primary text-white p-4 rounded-t-lg">
                    <h2 className="text-xl font-bold">Welcome to CritterTrack! 🎉</h2>
                    <p className="text-sm text-white/90">Let's get your profile set up for success</p>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    {/* Intro */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                        <p className="text-sm text-gray-700">
                            To make the most of CritterTrack's community features, we recommend setting up your profile information.
                        </p>
                    </div>

                    {/* Profile Settings - 2 Columns */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
                                    <User className="text-purple-600" size={18} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">Breeder Name & Privacy</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Set your <strong>Breeder Name</strong> in profile settings. Choose to display your personal name or breeder name publicly. 
                                    <strong> Note:</strong> You'll only be visible if you have either name set to public. Completely anonymous accounts won't show up anywhere, nor will their animals.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                                    <MapPin className="text-green-600" size={18} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">Country Location</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Setting your <strong>Country</strong> helps buyers find local breeders! When you list animals for sale or stud services, users can filter the marketplace by country. 
                                    This filter also exists for the <strong>Breeders</strong> Registry.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Users className="text-orange-600" size={18} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">Community Activity</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    The <strong>Community Feed</strong> showcases the newest and most active breeders, 
                                    helping you connect with others and discover what's happening in the community.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                                    <ShoppingBag className="text-blue-600" size={18} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">Breeders Registry</h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    In profile settings, select your breeding status (Owner, Active Breeder, or Retired Breeder) 
                                    for any <strong>species you have animals for</strong> on the site. This adds you to the public <strong>Breeders</strong> Registry.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-lg p-3">
                        <div className="flex gap-3 items-start">
                            <div className="flex-shrink-0">
                                <HelpCircle className="text-accent" size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">Need Help Getting Started?</h3>
                                <p className="text-xs text-gray-600">
                                    Interactive tutorials are available anytime through the <strong>Help button in the header</strong>. 
                                    Learn about adding animals, the <strong>Management View</strong> for daily feeding &amp; care tracking, 
                                    <strong> Supplies &amp; Inventory</strong>, per-animal <strong>Logs</strong>, genetics, budgeting, and more!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Beta Testing Message */}
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-300 rounded-lg p-3">
                        <div className="flex gap-3 items-start">
                            <div className="flex-shrink-0">
                                <MessageSquare className="text-purple-600" size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm mb-1">🚀 Beta Testing & Your Feedback</h3>
                                <p className="text-xs text-gray-600">
                                    CritterTrack is currently in <strong>beta</strong> and actively improving! We're working on bug fixes and new features. 
                                    Throughout the platform, you'll see <strong className="text-purple-700">purple features</strong> (like the purple "Beta Feedback" button on the left side of the screen) — 
                                    these are for beta feedback and suggestions. Don't hesitate to use them to share your thoughts, report issues, or suggest improvements. Your feedback helps shape the platform!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end pt-1">
                        <button
                            onClick={handleClose}
                            disabled={isClosing}
                            className="px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium text-sm disabled:opacity-50 flex items-center gap-2"
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
