import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const UrgentNotificationModal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[999] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-4 border-red-600 animate-pulse">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={28} className="flex-shrink-0 mt-1 animate-bounce" />
                        <h2 className="text-xl font-black">{title}</h2>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-red-50 border-l-4 border-red-600 p-4">
                        <p className="text-gray-800 whitespace-pre-wrap font-medium">{content}</p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-sm text-yellow-800 font-semibold">
                            ⚠️ This is an urgent system alert. Please acknowledge immediately.
                        </p>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                        <X size={18} />
                        I Acknowledge
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UrgentNotificationModal;
