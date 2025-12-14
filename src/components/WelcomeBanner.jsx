import React from 'react';
import { X, GraduationCap } from 'lucide-react';

const WelcomeBanner = ({ onStartTutorial, onDismiss }) => {
    return (
        <div className="w-full bg-white border-b-2 border-primary/20 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="bg-primary/20 p-2 rounded-lg">
                            <GraduationCap className="text-primary" size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">
                                👋 Welcome to CritterTrack!
                            </h3>
                            <p className="text-xs text-gray-600">
                                New here? Take a quick 5-minute tour to learn the essentials and get started tracking your animals.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onStartTutorial}
                            className="px-4 py-2 bg-primary hover:bg-primary-dark text-black text-sm font-semibold rounded-lg transition whitespace-nowrap"
                        >
                            Take the Tour
                        </button>
                        <button
                            onClick={onDismiss}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                            title="Dismiss (you can always access tutorials from the Help tab)"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeBanner;
