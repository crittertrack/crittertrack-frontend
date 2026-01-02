import React from 'react';
import { AlertTriangle } from 'lucide-react';

const MaintenanceModeBanner = ({ message }) => {
    return (
        <div className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white p-4 border-b-4 border-red-900 flex items-center gap-3 sticky top-0 z-50">
            <AlertTriangle size={24} className="flex-shrink-0" />
            <div>
                <p className="font-black text-lg">🔧 MAINTENANCE MODE ACTIVE</p>
                <p className="text-sm text-red-100 mt-1">{message || 'The system is currently undergoing maintenance. Please try again later.'}</p>
            </div>
        </div>
    );
};

export default MaintenanceModeBanner;
