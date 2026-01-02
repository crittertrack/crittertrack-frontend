import React, { useState } from 'react';
import { Lock, AlertCircle, X } from 'lucide-react';
import './ModerationAuthModal.css';

export default function ModerationAuthModal({ isOpen, onClose, onSuccess, API_BASE_URL, authToken }) {
    const [password, setPassword] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState('password'); // 'password' or 'request-code' or 'twofa'
    const [resendCooldown, setResendCooldown] = useState(0);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!password) {
            setError('Please enter your password');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-moderation-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid password');
            }

            if (data.requiresTwoFactor) {
                setStep('request-code');
                setPassword('');
            } else {
                onSuccess();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestCode = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/request-moderation-2fa-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send code');
            }

            setStep('twofa');
            setResendCooldown(60);
            
            // Start countdown timer for resend button
            const interval = setInterval(() => {
                setResendCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;
        await handleRequestCode();
    };

    const handleTwoFactorSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!twoFactorCode) {
            setError('Please enter your 2FA code');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-moderation-2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ code: twoFactorCode })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid 2FA code');
            }

            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="mod-auth-overlay" onClick={onClose}>
            <div className="mod-auth-modal" onClick={(e) => e.stopPropagation()}>
                <button className="mod-auth-close" onClick={onClose}>
                    <X size={24} />
                </button>
                <div className="mod-auth-header">
                    <div className="mod-auth-icon">
                        <Lock size={24} />
                    </div>
                    <h2>Enter Moderation Mode</h2>
                    <p className="mod-auth-subtitle">Verify your identity to access moderation tools</p>
                </div>

                <div className="mod-auth-content">
                    {error && (
                        <div className="mod-auth-error">
                            <AlertCircle size={18} />
                            <p>{error}</p>
                        </div>
                    )}

                    {step === 'password' ? (
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="form-group">
                                <label htmlFor="password">Password *</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mod-auth-submit"
                            >
                                {loading ? 'Verifying...' : 'Next'}
                            </button>
                        </form>
                    ) : step === 'request-code' ? (
                        <div className="mod-auth-request-code">
                            <p className="mod-auth-message">
                                A 6-digit verification code will be sent to your email.
                            </p>
                            
                            <button
                                type="button"
                                onClick={handleRequestCode}
                                disabled={loading}
                                className="mod-auth-submit"
                            >
                                {loading ? 'Sending...' : 'Send Code to Email'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep('password');
                                    setTwoFactorCode('');
                                    setError('');
                                }}
                                disabled={loading}
                                className="mod-auth-back"
                            >
                                Back
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleTwoFactorSubmit}>
                            <p className="mod-auth-2fa-info">
                                Enter the 6-digit code we just sent to your email
                            </p>
                            <div className="form-group">
                                <label htmlFor="code">2FA Code *</label>
                                <input
                                    id="code"
                                    type="text"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    disabled={loading}
                                    maxLength="6"
                                    autoFocus
                                    className="mod-auth-code-input"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || twoFactorCode.length !== 6}
                                className="mod-auth-submit"
                            >
                                {loading ? 'Verifying...' : 'Enter Moderation Mode'}
                            </button>

                            <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={loading || resendCooldown > 0}
                                className="mod-auth-resend"
                            >
                                {resendCooldown > 0 
                                    ? `Resend in ${resendCooldown}s`
                                    : 'Resend Code'}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep('request-code');
                                    setTwoFactorCode('');
                                    setResendCooldown(0);
                                    setError('');
                                }}
                                disabled={loading}
                                className="mod-auth-back"
                            >
                                Back
                            </button>
                        </form>
                    )}
                </div>

                <button
                    onClick={onClose}
                    disabled={loading}
                    className="mod-auth-close"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
