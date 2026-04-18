import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    AlertCircle, Ban, Bean, Cat, CheckCircle, Eye, EyeOff,
    Heart, HeartOff, Hourglass, Loader2, LogIn, Mail, Milk, UserPlus, Users
} from 'lucide-react';
import InstallPWA from '../InstallPWA';

const API_BASE_URL = '/api';

const AuthView = ({ onLoginSuccess, showModalMessage, isRegister, setIsRegister, mainTitle, onShowTerms, onShowPrivacy, userCount }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [personalName, setPersonalName] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationStep, setVerificationStep] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState(0); // 0=off, 1=email, 2=code, 3=new password
    const [resetEmail, setResetEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [suspensionInfo, setSuspensionInfo] = useState(null);
    const [suspensionTimeRemaining, setSuspensionTimeRemaining] = useState(null);
    const [banInfo, setBanInfo] = useState(null);
    const [suspensionLiftedNotification, setSuspensionLiftedNotification] = useState(null);

    // Restore verification state from localStorage on mount
    useEffect(() => {
        const savedVerificationState = localStorage.getItem('pendingVerification');
        if (savedVerificationState) {
            try {
                const { email: savedEmail, verificationStep: savedStep } = JSON.parse(savedVerificationState);
                setEmail(savedEmail);
                setVerificationStep(savedStep);
                setIsRegister(true);
            } catch (error) {
                console.error('Failed to restore verification state:', error);
                localStorage.removeItem('pendingVerification');
            }
        }
        
        // Check URL for password reset token
        const params = new URLSearchParams(window.location.search);
        const resetToken = params.get('token');
        const resetTokenEmail = params.get('email');
        if (resetToken && resetTokenEmail) {
            setForgotPasswordStep(3);
            setResetCode(resetToken);
            setResetEmail(resetTokenEmail);
        }
    }, []);

    // Persist verification state to localStorage when it changes
    useEffect(() => {
        if (verificationStep && email) {
            localStorage.setItem('pendingVerification', JSON.stringify({ 
                email, 
                verificationStep: true 
            }));
        } else {
            localStorage.removeItem('pendingVerification');
        }
    }, [verificationStep, email]);

    // Check for suspension info and update timer
    useEffect(() => {
        const suspensionEndTime = localStorage.getItem('suspensionEndTime');
        const suspensionReason = localStorage.getItem('suspensionReason');
        
        if (suspensionEndTime) {
            setSuspensionInfo({
                endTime: parseInt(suspensionEndTime),
                reason: suspensionReason || 'Your account has been suspended.'
            });
        }
        
        // Check for ban info
        const banReason = localStorage.getItem('banReason');
        const banType = localStorage.getItem('banType');
        
        if (banReason) {
            setBanInfo({
                reason: banReason,
                type: banType || 'banned'
            });
        }
    }, []);

    // Update suspension countdown timer
    useEffect(() => {
        if (!suspensionInfo) return;
        
        const updateTimer = () => {
            const now = new Date().getTime();
            const timeLeft = suspensionInfo.endTime - now;
            
            if (timeLeft <= 0) {
                // Suspension expired
                setSuspensionTimeRemaining(null);
                localStorage.removeItem('suspensionEndTime');
                localStorage.removeItem('suspensionReason');
                setSuspensionInfo(null);
            } else {
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                
                // Format end date as dd/mm/yyyy
                const endDate = new Date(suspensionInfo.endTime);
                const day = String(endDate.getDate()).padStart(2, '0');
                const month = String(endDate.getMonth() + 1).padStart(2, '0');
                const year = endDate.getFullYear();
                const endDateStr = `${day}/${month}/${year}`;
                
                // Build time string - show days/hours/minutes plus expiry date
                const timeParts = [];
                if (days > 0) timeParts.push(`${days}d`);
                if (hours > 0 || days > 0) timeParts.push(`${hours}h`);
                timeParts.push(`${minutes}m`);
                
                setSuspensionTimeRemaining(`${timeParts.join(' ')} | Expires: ${endDateStr}`);
            }
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute
        
        return () => clearInterval(interval);
    }, [suspensionInfo]);

    // Check for and manage suspension lift notification
    useEffect(() => {
        const suspensionLiftedData = localStorage.getItem('suspensionLiftedNotification');
        
        if (suspensionLiftedData) {
            try {
                const { expiresAt } = JSON.parse(suspensionLiftedData);
                const now = new Date().getTime();
                
                if (now < expiresAt) {
                    // Notification is still valid (within 24 hours)
                    setSuspensionLiftedNotification(true);
                } else {
                    // Notification has expired
                    localStorage.removeItem('suspensionLiftedNotification');
                    setSuspensionLiftedNotification(null);
                }
            } catch (error) {
                console.error('Error parsing suspension lift notification:', error);
                localStorage.removeItem('suspensionLiftedNotification');
            }
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        if (isRegister && !verificationStep) {
            // Step 1: Request verification code
            if (!agreedToTerms) {
                showModalMessage('Terms Required', 'You must agree to the Terms of Service and Privacy Policy to register.');
                setLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                showModalMessage('Password Mismatch', 'Passwords do not match. Please try again.');
                setLoading(false);
                return;
            }
            try {
                await axios.post(`${API_BASE_URL}/auth/register-request`, {
                    email,
                    password,
                    personalName
                });
                setVerificationStep(true);
                showModalMessage('Verification Code Sent', 'Please check your email for a 6-digit verification code.');
            } catch (error) {
                console.error('Registration request error:', error.response?.data || error.message);
                showModalMessage(
                    'Registration Failed',
                    error.response?.data?.message || 'Failed to send verification code. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        } else if (isRegister && verificationStep) {
            // Step 2: Verify code and complete registration
            try {
                const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
                    email,
                    code: verificationCode
                });
                localStorage.removeItem('pendingVerification');
                showModalMessage('Registration Success', 'Your account has been verified! You are now logged in.');
                onLoginSuccess(response.data.token);
                setVerificationStep(false);
                setVerificationCode('');
            } catch (error) {
                console.error('Verification error:', error.response?.data || error.message);
                showModalMessage(
                    'Verification Failed',
                    error.response?.data?.message || 'Invalid or expired verification code. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        } else {
            // Login flow (unchanged)
            try {
                const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
                
                // Clear any old suspension data on successful login
                localStorage.removeItem('suspensionEndTime');
                localStorage.removeItem('suspensionReason');
                localStorage.removeItem('banReason');
                localStorage.removeItem('banType');
                setSuspensionInfo(null);
                setSuspensionTimeRemaining(null);
                setBanInfo(null);
                
                onLoginSuccess(response.data.token);
            } catch (error) {
                console.error('Login error:', error.response?.data || error.message);
                
                // Check if this is a suspension or ban error (403)
                if (error.response?.status === 403) {
                    const message = error.response?.data?.message || '';
                    
                    if (message.includes('Account suspended')) {
                        // Parse suspension message and extract expiry time
                        console.log('[LOGIN] User account suspended:', message);
                        
                        // Check if suspension end time already exists in localStorage
                        const existingEndTime = localStorage.getItem('suspensionEndTime');
                        let suspensionEndTime;
                        
                        // PRIORITY 1: Use structured expiryTimestamp from response (most accurate, directly from server)
                        const responseTimestamp = error.response?.data?.expiryTimestamp;
                        
                        if (responseTimestamp) {
                            // Use the structured expiryTimestamp from response data - it's the source of truth
                            console.log('[LOGIN] Using server expiryTimestamp:', responseTimestamp);
                            suspensionEndTime = responseTimestamp;
                        } else {
                            // PRIORITY 2: Try to extract from message string (fallback)
                            const timestampMatch = message.match(/ExpiryTimestamp:\s*(\d+)/);
                            
                            if (timestampMatch) {
                                console.log('[LOGIN] Using expiryTimestamp from message');
                                suspensionEndTime = parseInt(timestampMatch[1]);
                            } else if (existingEndTime) {
                                // PRIORITY 3: Use existing stored time (don't reset timer on retry)
                                console.log('[LOGIN] Using stored suspension end time');
                                suspensionEndTime = parseInt(existingEndTime);
                            } else {
                                // PRIORITY 4: Last resort - calculate from hours/minutes
                                console.log('[LOGIN] Calculating from hours/minutes (fallback)');
                                const hoursMatch = message.match(/(\d+)\s+hour/);
                                const minutesMatch = message.match(/(\d+)\s+minute/);
                                const hoursRemaining = hoursMatch ? parseInt(hoursMatch[1]) : 0;
                                const minutesRemaining = minutesMatch ? parseInt(minutesMatch[1]) : 0;
                                
                                console.log('[LOGIN] Parsed hours:', hoursRemaining, 'minutes:', minutesRemaining);
                                
                                const totalMilliseconds = (hoursRemaining * 60 * 60 * 1000) + (minutesRemaining * 60 * 1000);
                                console.log('[LOGIN] Total milliseconds:', totalMilliseconds);
                                
                                if (totalMilliseconds > 0) {
                                    suspensionEndTime = new Date().getTime() + totalMilliseconds;
                                    console.log('[LOGIN] Calculated end time:', suspensionEndTime);
                                } else {
                                    console.error('[LOGIN] Could not extract suspension duration from message, defaulting to 24 hours');
                                    suspensionEndTime = new Date().getTime() + (24 * 60 * 60 * 1000);
                                }
                            }
                        }
                        
                        // Extract reason - try multiple patterns to be robust
                        let suspensionReason = 'Your account has been suspended.';
                        
                        // Try pattern 1: Extract everything between "Account suspended:" and "Expires in"
                        const reasonMatch1 = message.match(/Account suspended:\s*(.+?)\s+Expires in/i);
                        if (reasonMatch1) {
                            suspensionReason = reasonMatch1[1].trim();
                        } else {
                            // Try pattern 2: Extract everything after "Account suspended:" until we hit "ExpiryTimestamp"
                            const reasonMatch2 = message.match(/Account suspended:\s*(.+?)\s+ExpiryTimestamp/i);
                            if (reasonMatch2) {
                                suspensionReason = reasonMatch2[1].trim();
                            } else {
                                // Try pattern 3: Extract everything after "Account suspended:" (greedy, in case Expires in isn't there)
                                const reasonMatch3 = message.match(/Account suspended:\s*(.+)/i);
                                if (reasonMatch3) {
                                    let text = reasonMatch3[1];
                                    // Remove ExpiryTimestamp if it exists
                                    text = text.replace(/\s*ExpiryTimestamp:.+$/i, '').trim();
                                    // Remove Expires in... if it exists
                                    text = text.replace(/\s*Expires in.+$/i, '').trim();
                                    if (text) {
                                        suspensionReason = text;
                                    }
                                }
                            }
                        }
                        
                        console.log('[LOGIN] Extracted suspension reason:', suspensionReason);
                        
                        // Store suspension info for display on login screen (always update with server timestamp)
                        localStorage.setItem('suspensionEndTime', suspensionEndTime.toString());
                        localStorage.setItem('suspensionReason', suspensionReason);
                        
                        // Trigger re-render of suspension banner
                        setSuspensionInfo({
                            endTime: suspensionEndTime,
                            reason: suspensionReason
                        });
                        
                        // Don't show error modal for suspension - let the banner display it
                        return;
                    } else if (message.includes('Account banned')) {
                        // Extract ban reason and type
                        const banReasonMatch = message.match(/^Account banned:\s*(.+?)(?:\s+\(IP Ban\))?$/);
                        const banReason = banReasonMatch ? banReasonMatch[1] : 'Your account has been permanently banned.';
                        const isIPBan = message.includes('IP Ban');
                        
                        // Store ban info for display on login screen
                        localStorage.setItem('banReason', banReason);
                        localStorage.setItem('banType', isIPBan ? 'ip-ban' : 'banned');
                        
                        // Trigger re-render of ban banner
                        setBanInfo({
                            reason: banReason,
                            type: isIPBan ? 'ip-ban' : 'banned'
                        });
                        
                        // Don't show error modal for ban - let the banner display it
                        return;
                    }
                }
                
                // If login failed for any reason OTHER than suspension, clear old suspension data
                // This handles the case where suspension was lifted but user typed wrong password
                localStorage.removeItem('suspensionEndTime');
                localStorage.removeItem('suspensionReason');
                localStorage.removeItem('banReason');
                localStorage.removeItem('banType');
                setSuspensionInfo(null);
                setSuspensionTimeRemaining(null);
                setBanInfo(null);
                
                showModalMessage(
                    'Login Failed',
                    error.response?.data?.message || 'An unexpected error occurred. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (forgotPasswordStep === 1) {
            // Step 1: Request password reset
            setLoading(true);
            try {
                await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email: resetEmail });
                showModalMessage('Check Your Email', 'A password reset email has been sent. Click the button in the email to continue.');
                setForgotPasswordStep(2);
            } catch (error) {
                console.error('Forgot password error:', error.response?.data || error.message);
                showModalMessage(
                    'Request Failed',
                    error.response?.data?.message || 'Failed to send reset email. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        } else if (forgotPasswordStep === 2) {
            // Step 2: User should have clicked the button in email - skip to step 3
            // This shouldn't normally be reached, but kept for safety
            setForgotPasswordStep(3);
        } else if (forgotPasswordStep === 3) {
            // Step 3: Reset password with code and new password
            if (newPassword !== confirmNewPassword) {
                showModalMessage('Password Mismatch', 'Passwords do not match.');
                return;
            }
            setLoading(true);
            try {
                await axios.post(`${API_BASE_URL}/auth/reset-password`, {
                    email: resetEmail,
                    token: resetCode,
                    newPassword
                });
                showModalMessage('Success', 'Password reset successful! You can now log in with your new password.');
                setForgotPasswordStep(0);
                setResetEmail('');
                setResetCode('');
                setNewPassword('');
                setConfirmNewPassword('');
            } catch (error) {
                console.error('Reset password error:', error.response?.data || error.message);
                showModalMessage(
                    'Reset Failed',
                    error.response?.data?.message || 'Failed to reset password. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        }
    };

    const closeForgotPassword = () => {
        setForgotPasswordStep(0);
        setResetEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
    };

    const handleResendCode = async () => {
        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/auth/resend-verification`, { email });
            showModalMessage('Code Resent', 'A new verification code has been sent to your email.');
        } catch (error) {
            console.error('Resend error:', error.response?.data || error.message);
            showModalMessage('Resend Failed', error.response?.data?.message || 'Failed to resend code.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToRegistration = () => {
        setVerificationStep(false);
        setVerificationCode('');
        localStorage.removeItem('pendingVerification');
    };

    const handleClearCode = () => {
        setVerificationCode('');
    };

    return (
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl">
            {!forgotPasswordStep && !verificationStep && (
                <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 flex items-center gap-4 shadow">
                    <Users size={32} className="text-primary-dark" />
                    <div>
                        <div className="text-lg font-bold text-gray-800">
                            Join {userCount} breeders & keepers!
                        </div>
                        <div className="text-sm text-gray-700">
                            Be part of a growing community. Register now and connect with passionate breeders and keepers worldwide!
                        </div>
                    </div>
                </div>
            )}
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                {forgotPasswordStep > 0 ? 'Reset Password' : (verificationStep ? 'Verify Your Email' : mainTitle)}
            </h2>

            {forgotPasswordStep > 0 ? (
                // Forgot Password Flow
                <form onSubmit={handleForgotPassword} className="space-y-4">
                    {forgotPasswordStep === 1 && (
                        <div>
                            <p className="text-sm text-gray-600 mb-4">Enter the email address associated with your account.</p>
                            <input
                                type="email"
                                placeholder="Email Address *"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                            />
                        </div>
                    )}
                    
                    {forgotPasswordStep === 2 && (
                        <div>
                            <p className="text-sm text-gray-600 mb-4"><Mail size={14} className="inline-block align-middle mr-1" /> Check your email for a password reset button. Click it to proceed with resetting your password.</p>
                            <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-200">The reset link will expire in 1 hour.</p>
                        </div>
                    )}
                    
                    {forgotPasswordStep === 3 && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600 mb-4">Enter your new password.</p>
                            <input
                                type="password"
                                placeholder="New Password *"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                            />
                            <input
                                type="password"
                                placeholder="Confirm Password *"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                            />
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        disabled={loading || (forgotPasswordStep === 1 && !resetEmail) || (forgotPasswordStep === 2) || (forgotPasswordStep === 3 && (!newPassword || !confirmNewPassword))}
                        className="w-full bg-primary text-black font-bold py-3 rounded-lg shadow-md hover:bg-primary/90 transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : (
                            forgotPasswordStep === 1 ? 'Send Reset Email' : 
                            forgotPasswordStep === 2 ? 'I clicked the email button' : 
                            'Reset Password'
                        )}
                    </button>
                    
                    <button
                        type="button"
                        onClick={closeForgotPassword}
                        className="w-full text-sm text-gray-600 hover:text-gray-800 transition py-2"
                    >
                        ? Back to Login
                    </button>
                </form>
            ) : verificationStep ? (
                // Step 2: Verification Code Form
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">
                            We sent a 6-digit code to <strong>{email}</strong>
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            Code expires in 10 minutes
                        </p>
                    </div>
                    
                    <input 
                        type="text" 
                        placeholder="Enter 6-digit code" 
                        value={verificationCode} 
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                        required 
                        maxLength={6}
                        pattern="[0-9]{6}"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition text-center text-2xl tracking-widest font-mono"
                    />
                    
                    <button
                        type="submit"
                        disabled={loading || verificationCode.length !== 6}
                        className="w-full bg-primary text-black font-bold py-3 rounded-lg shadow-md hover:bg-primary/90 transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Verify & Create Account'}
                    </button>

                    <div className="flex flex-col space-y-2 mt-4 border-t pt-4">
                        <button 
                            type="button" 
                            onClick={handleClearCode}
                            disabled={loading}
                            className="text-sm text-accent hover:text-accent/80 transition duration-150 font-medium py-1"
                        >
                            Clear Code & Try Again
                        </button>
                        <button 
                            type="button" 
                            onClick={handleResendCode}
                            disabled={loading}
                            className="text-sm text-accent hover:text-accent/80 transition duration-150 font-medium py-1"
                        >
                            Resend Code
                        </button>
                        <button 
                            type="button" 
                            onClick={handleBackToRegistration}
                            className="text-sm text-gray-600 hover:text-gray-800 transition duration-150 py-1"
                        >
                            ? Change Email or Start Over
                        </button>
                    </div>
                </form>
            ) : (
                // Step 1: Registration/Login Form
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {suspensionLiftedNotification && (
                        <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                                <div className="ml-3 w-full">
                                    <p className="text-sm font-bold text-green-900">Good News! ??</p>
                                    <p className="text-sm text-green-800 mt-2">Your suspension has been lifted. You can now log in to your account.</p>
                                    <p className="text-xs text-green-600 mt-2">This message will disappear in 24 hours.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {suspensionInfo && (
                        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="ml-3 w-full">
                                    <p className="text-sm font-bold text-red-900">Account Suspended</p>
                                    <p className="text-sm text-red-800 mt-2 font-semibold">Reason:</p>
                                    <p className="text-sm text-red-700 mt-1 bg-red-50 p-2 rounded border border-red-200">{suspensionInfo.reason}</p>
                                    {suspensionTimeRemaining && (
                                        <p className="text-sm text-red-700 mt-3 font-semibold">
                                            Time remaining: <span className="text-lg text-red-900">{suspensionTimeRemaining}</span>
                                        </p>
                                    )}
                                    <p className="text-xs text-red-600 mt-3">
                                        <a href={`mailto:CrittertrackOwner@gmail.com?subject=Suspension Appeal&body=I would like to appeal my account suspension.%0D%0A%0D%0AReason for suspension: ${encodeURIComponent(suspensionInfo.reason)}%0D%0A%0D%0AMy appeal:`} className="underline hover:text-red-800 font-semibold">
                                            Submit an appeal
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {banInfo && (
                        <div className="bg-red-900 border-l-4 border-red-700 p-4 rounded">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Ban className="h-5 w-5 text-red-200" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-100">
                                        Account {banInfo.type === 'ip-ban' ? 'IP Banned' : 'Permanently Banned'}
                                    </p>
                                    <p className="text-sm text-red-200 mt-1">{banInfo.reason}</p>
                                    <p className="text-sm text-red-300 mt-2">
                                        {banInfo.type === 'ip-ban' 
                                            ? 'Your IP address has been banned from creating accounts or accessing the platform.' 
                                            : 'This account has been permanently banned from accessing the platform.'}
                                    </p>
                                    <p className="text-xs text-red-200 mt-2">
                                        <a href={`mailto:CrittertrackOwner@gmail.com?subject=${banInfo.type === 'ip-ban' ? 'IP Ban' : 'Ban'} Appeal&body=I would like to appeal my account ban.%0D%0A%0D%0AReason for ban: ${encodeURIComponent(banInfo.reason)}%0D%0A%0D%0AMy appeal:`} className="underline hover:text-red-100">
                                            Submit an appeal
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {isRegister && (
                        <input type="text" placeholder="Your Personal Name *" value={personalName} onChange={(e) => setPersonalName(e.target.value)} required 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" />
                    )}
                    
                    <input type="email" placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} required 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" />
                    <input type="password" placeholder="Password *" value={password} onChange={(e) => setPassword(e.target.value)} required 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" />
                    
                    {isRegister && (
                        <input 
                            type="password" 
                            placeholder="Confirm Password *" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition" 
                        />
                    )}
                    
                    {isRegister && (
                        <label className="flex items-start space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                required
                                className="mt-1 h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                            />
                            <span className="text-sm text-gray-700">
                                I agree to the{' '}
                                <button
                                    type="button"
                                    onClick={onShowTerms}
                                    className="text-accent hover:text-accent/80 underline font-medium"
                                >
                                    Terms of Service
                                </button>
                                {' '}and{' '}
                                <button
                                    type="button"
                                    onClick={onShowPrivacy}
                                    className="text-accent hover:text-accent/80 underline font-medium"
                                >
                                    Privacy Policy
                                </button>
                            </span>
                        </label>
                    )}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-black font-bold py-3 rounded-lg shadow-md hover:bg-primary/90 transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : (isRegister ? <><UserPlus size={20} className="mr-2" /> Register</> : <><LogIn size={20} className="mr-2" /> Log In</>)}
                    </button>
                </form>
            )}
            
            {!verificationStep && forgotPasswordStep === 0 && (
                <>
                    <div className="mt-6 text-center space-y-3">
                        {!isRegister && (
                            <button type="button" onClick={() => setForgotPasswordStep(1)}
                                className="block w-full text-sm text-accent hover:text-accent/80 transition duration-150 font-medium"
                            >
                                Forgot Password?
                            </button>
                        )}
                        <button type="button" onClick={() => setIsRegister(prev => !prev)}
                            className="block w-full text-sm text-accent hover:text-accent/80 transition duration-150 font-medium"
                        >
                            {isRegister ? 'Already have an account? Log In' : "Don't have an account? Register Here"}
                        </button>
                    </div>
                    
                    <div className="mt-4">
                        <InstallPWA />
                    </div>
                </>
            )}
            
            <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500 space-x-4">
                <button onClick={onShowTerms} className="hover:text-primary transition">
                    Terms of Service
                </button>
                <span>|</span>
                <button onClick={onShowPrivacy} className="hover:text-primary transition">
                    Privacy Policy
                </button>
            </div>
        </div>
    );
};

export default AuthView;
