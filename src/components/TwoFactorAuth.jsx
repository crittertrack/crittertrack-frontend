import React, { useState, useEffect } from 'react';
import { Mail, X, Loader2, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const TwoFactorAuth = ({ 
    isOpen, 
    onClose, 
    onVerify, 
    email, 
    authToken, 
    API_BASE_URL,
    isLoading = false 
}) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [codeError, setCodeError] = useState('');
    const [resending, setResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [verified, setVerified] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCodeError('');

        if (!code.trim()) {
            setCodeError('Please enter the 6-digit code');
            return;
        }

        if (code.length !== 6 || !/^\d+$/.test(code)) {
            setCodeError('Code must be 6 digits');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/verify-2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ code })
            });

            if (response.ok) {
                setVerified(true);
                setTimeout(() => {
                    onVerify(true);
                }, 1000);
            } else {
                const data = await response.json();
                setCodeError(data.error || 'Invalid code. Please try again.');
            }
        } catch (error) {
            console.error('Error verifying 2FA code:', error);
            setCodeError('Error verifying code. Please try again.');
        }
    };

    const handleResendCode = async () => {
        setResending(true);
        setCodeError('');
        try {
            const response = await fetch(`${API_BASE_URL}/admin/resend-2fa-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setTimeLeft(300); // Reset timer
                setCode('');
                alert('New code sent to your email');
            } else {
                setCodeError('Failed to resend code');
            }
        } catch (error) {
            console.error('Error resending code:', error);
            setCodeError('Error resending code');
        } finally {
            setResending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                    <div className="flex items-center gap-3">
                        <Mail size={28} />
                        <h2 className="text-2xl font-bold">Verify Your Identity</h2>
                    </div>
                </div>

                {verified ? (
                    <div className="p-8 text-center space-y-4">
                        <div className="flex justify-center">
                            <CheckCircle size={64} className="text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Verified!</h3>
                        <p className="text-gray-600">Access granted to admin panel</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-4">
                                We've sent a 6-digit code to:
                            </p>
                            <p className="font-mono text-gray-800 bg-gray-50 p-3 rounded-lg text-center">
                                {email}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Enter 6-Digit Code
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setCode(val);
                                    setCodeError('');
                                }}
                                placeholder="000000"
                                maxLength={6}
                                className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20"
                                autoFocus
                                disabled={isLoading || resending}
                            />
                            {codeError && (
                                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                                    <AlertCircle size={16} />
                                    {codeError}
                                </p>
                            )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800 flex items-center gap-2">
                                <Clock size={16} />
                                Code expires in: <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                            </p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || code.length !== 6}
                                className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Code'
                                )}
                            </button>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={resending || timeLeft > 60}
                                className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition"
                            >
                                {resending ? 'Sending...' : timeLeft > 60 ? 'Resend Code' : `Resend Code (${formatTime(timeLeft)})`}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition"
                        >
                            Cancel
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TwoFactorAuth;
