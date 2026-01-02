import React, { useState, useEffect } from 'react';
import { LogIn, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const LoginTracking = ({ authToken, API_BASE_URL }) => {
    const [loginHistory, setLoginHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLoginHistory();
        // Check for new logins every 30 seconds
        const interval = setInterval(fetchLoginHistory, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchLoginHistory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/login-history`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Ensure data is an array
                if (Array.isArray(data)) {
                    setLoginHistory(data);
                } else {
                    console.warn('Login history response is not an array:', data);
                    setLoginHistory([]);
                }
            } else {
                console.warn('Failed to fetch login history:', response.status);
                setLoginHistory([]);
            }
        } catch (error) {
            console.error('Error fetching login history:', error);
            setLoginHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircle size={18} className="text-green-600" />;
            case 'failed':
                return <XCircle size={18} className="text-red-600" />;
            case 'suspicious':
                return <AlertCircle size={18} className="text-yellow-600" />;
            default:
                return <LogIn size={18} className="text-gray-600" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'success':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'suspicious':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <LogIn size={20} />
                Your Recent Login Activity
            </h3>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {loginHistory.length === 0 ? (
                    <div className="p-8 text-center text-gray-600">
                        No login history available
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">IP Address</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Device</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">2FA Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loginHistory.map((entry, index) => (
                                    <tr
                                        key={index}
                                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-gray-100 transition`}
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-800">
                                            <div>
                                                <p className="font-medium">{new Date(entry.timestamp).toLocaleString()}</p>
                                                <p className="text-xs text-gray-500">{new Date(entry.timestamp).toTimeString().split(' ')[1]}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800">
                                            <p className="font-mono">{entry.ipAddress}</p>
                                            <p className="text-xs text-gray-500">{entry.location || 'Location unknown'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-800">
                                            <p>{entry.deviceName || 'Unknown Device'}</p>
                                            <p className="text-xs text-gray-500">{entry.userAgent}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                entry.twoFactorVerified
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {entry.twoFactorVerified ? 'Verified' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(entry.status)}
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(entry.status)}`}>
                                                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Security Tip:</strong> If you see a login you don't recognize, please change your password immediately and contact support.
                </p>
            </div>
        </div>
    );
};

export default LoginTracking;
