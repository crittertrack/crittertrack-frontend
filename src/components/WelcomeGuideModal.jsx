import React from 'react';
import { User, MapPin, Users, ShoppingBag, HelpCircle } from 'lucide-react';

const WelcomeGuideModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-accent to-primary text-white p-6 rounded-t-lg">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Welcome to CritterTrack! 🎉</h2>
                        <p className="text-white/90">Let's get your profile set up for success</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Intro */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <p className="text-gray-700">
                            To make the most of CritterTrack's community features, we recommend setting up your profile information. 
                            Here's what you should know:
                        </p>
                    </div>

                    {/* Profile Settings */}
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <User className="text-purple-600" size={20} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 mb-1">Breeder Name & Privacy</h3>
                                <p className="text-sm text-gray-600">
                                    Set your <strong>Breeder Name</strong> in your profile settings. You can choose to display 
                                    either your personal name or breeder name publicly. This is what other users will see when 
                                    viewing your animals or in the community. <strong>Note:</strong> You'll only be visible if you 
                                    have either of these names set to public. Completely anonymous accounts will not show up anywhere, 
                                    nor will their animals.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <MapPin className="text-green-600" size={20} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 mb-1">Country Location</h3>
                                <p className="text-sm text-gray-600">
                                    Setting your <strong>Country</strong> helps buyers find local breeders! When you list animals 
                                    for sale or stud services, users can filter the marketplace by country to find animals near them. 
                                    This filter also exists for the Breeder Registry to help users find breeders in their region.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Users className="text-orange-600" size={20} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 mb-1">Community Activity</h3>
                                <p className="text-sm text-gray-600">
                                    The <strong>Community Feed</strong> showcases the newest and most active breeders, 
                                    helping you connect with others and discover what's happening in the community.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <ShoppingBag className="text-blue-600" size={20} />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 mb-1">Breeder Registry</h3>
                                <p className="text-sm text-gray-600">
                                    In your profile settings, you can select your breeding status (Owner, Active Breeder, or Retired Breeder) 
                                    for any <strong>species you have animals for</strong> on the site. This will add you to the public <strong>Breeders</strong> Directory, 
                                    making it easier for others to find you.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-6"></div>

                    {/* Help Section */}
                    <div className="bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 rounded-lg p-4">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <HelpCircle className="text-accent" size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">Need Help Getting Started?</h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    Interactive tutorials are available anytime through the <strong>Help button (?) in the header</strong>. 
                                    Learn about adding animals, tracking genetics, budgeting, and more!
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
                        >
                            Got it, let's get started!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeGuideModal;
