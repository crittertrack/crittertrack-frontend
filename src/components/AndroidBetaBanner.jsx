import React, { useState } from 'react';
import { X, Smartphone, Mail, Loader2, Download, CheckCircle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import apiClient from '../utils/apiClient';
import { openExternalLink } from '../utils/externalLink';
import InstallPWA from './InstallPWA';

const DISMISS_KEY = 'ct_dismissed_android_beta_banner_v1';
export const ANDROID_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.crittertrack.app';

// Opt-in modal — collects the Google account email (NOT the CritterTrack account email) that
// the developer manually adds to the Play Console's closed testing tester list. See
// crittertrack-pedigree/routes/androidBetaRoutes.js for the backend side.
const AndroidBetaOptInModal = ({ onClose, onSubmitted }) => {
    const [googleEmail, setGoogleEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const response = await apiClient.post('/android-beta/opt-in', { googleEmail });
            onSubmitted(response.data?.androidBetaOptIn);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text flex items-center gap-2">
                        <Smartphone size={20} className="text-primary-dark dark:text-dark-primary" />
                        Join the Android Beta
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-dark-text">
                        <X size={20} />
                    </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">
                    Enter the email address of the <strong>Google account you're signed in with on your Android
                    device</strong> — this must be a Google account email, <strong>not</strong> your CritterTrack
                    account email. We'll add it to the Play Store closed-testing tester list.
                </p>

                {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/60 rounded-lg px-3 py-2 mb-3">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-dark-text-muted" />
                        <input
                            type="email"
                            required
                            value={googleEmail}
                            onChange={(e) => setGoogleEmail(e.target.value)}
                            placeholder="you@gmail.com"
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-dark-text-muted bg-white dark:bg-dark-card-bg text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                        />
                    </div>

                    <p className="text-xs text-gray-500 dark:text-dark-text-muted">
                        Emails are added manually, so it can take <strong>up to 24 hours</strong> before your Google
                        account has access to download the beta.
                    </p>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-primary dark:bg-dark-primary text-black font-bold py-2.5 rounded-lg shadow-md hover:bg-primary/90 transition duration-150 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                        {submitting ? 'Submitting…' : 'Submit Email'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Android Play Store closed-testing banner — shown on the web app (never inside the native
// Android app itself, which is what's being promoted). Two states: before opting in, shows a
// short message + a button that opens AndroidBetaOptInModal; after opting in, replaces the
// button with the Play Store opt-in link plus the reminders about the 24h delay, the 14-day
// minimum sign-in requirement, and sending feedback through Google Play.
const AndroidBetaBanner = ({ userProfile, setUserProfile }) => {
    const [dismissed, setDismissed] = useState(() => {
        try { return localStorage.getItem(DISMISS_KEY) === 'true'; } catch { return false; }
    });
    const [showModal, setShowModal] = useState(false);

    // Never shown inside the native Android app itself — that's the app being promoted.
    if (Capacitor.isNativePlatform()) return null;
    if (dismissed) return null;

    const dismiss = () => {
        try { localStorage.setItem(DISMISS_KEY, 'true'); } catch { /* ignore */ }
        setDismissed(true);
    };

    const optedIn = !!userProfile?.androidBetaOptIn?.googleEmail;

    return (
        <div className="max-w-7xl mx-auto mb-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm rounded-lg shadow-md px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex-1">
                {!optedIn ? (
                    <>
                        <span>
                            🤖 CritterTrack is now in <strong>closed beta testing</strong> on the Google Play Store!
                            Want in? Submit your Google account email below.
                        </span>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className="bg-white/20 hover:bg-white/30 font-semibold px-3 py-1.5 rounded-lg transition text-xs"
                            >
                                Join the Android Beta
                            </button>
                            <InstallPWA
                                compact
                                compactLabel="Not on Android but still want an app? Add CritterTrack to your home screen"
                                compactClassName="text-xs font-medium text-white/90 hover:text-white underline underline-offset-2 transition"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle size={15} className="flex-shrink-0" />
                            You're opted in with <strong>{userProfile.androidBetaOptIn.googleEmail}</strong>. It can
                            take up to <strong>24 hours</strong> for access to be granted.
                        </span>
                        <p className="mt-1.5 text-xs text-white/90">
                            Once you're in, please stay signed into the app for at least <strong>14 days</strong>,
                            and send any feedback through the Google Play Store's beta feedback option rather than
                            CritterTrack support.
                        </p>
                        <div className="mt-2">
                            <button
                                type="button"
                                onClick={() => openExternalLink(ANDROID_PLAY_STORE_URL)}
                                className="bg-white/20 hover:bg-white/30 font-semibold px-3 py-1.5 rounded-lg transition text-xs inline-flex items-center gap-1.5"
                            >
                                <Download size={14} />
                                Download on Google Play
                            </button>
                        </div>
                    </>
                )}
            </div>
            <button
                onClick={dismiss}
                className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition"
                title="Dismiss"
            >
                <X size={16} />
            </button>

            {showModal && (
                <AndroidBetaOptInModal
                    onClose={() => setShowModal(false)}
                    onSubmitted={(androidBetaOptIn) => {
                        setShowModal(false);
                        if (setUserProfile) {
                            setUserProfile((prev) => (prev ? { ...prev, androidBetaOptIn } : prev));
                        }
                    }}
                />
            )}
        </div>
    );
};

export default AndroidBetaBanner;
