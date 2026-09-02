import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Loader2, XCircle, Download, X, Lock } from 'lucide-react';
import CustomAppLogo from './components/shared/CustomAppLogo';
import ViewAnimalModalV2 from './components/AnimalDetail/ViewAnimalModalV2';
import PublicProfileView from './components/PublicProfile/PublicProfileView';
import { API_BASE_URL } from './utils/apiConfig';
import { downloadBlob } from './utils/nativeDownload';

const PrivateAnimalScreen = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-page-bg dark:bg-dark-bg flex flex-col items-center justify-center p-6">
            <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-lg p-8 max-w-md text-center">
                <Lock size={64} className="text-gray-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">This Animal is Private</h1>
                <p className="text-gray-600 mb-6">
                    This animal doesn't have a public profile available. The owner has not shared this animal publicly.
                </p>
                <button
                    onClick={onBack}
                    className="w-full px-4 py-2 bg-primary dark:bg-dark-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

const PublicAnimalPage = () => {
    const { animalId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [animal, setAnimal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);

    // Check if user is in moderator mode
    const authToken = localStorage.getItem('authToken');
    const inModeratorMode = localStorage.getItem('moderationAuthenticated') === 'true';

    // Determine where to go back to
    const handleGoBack = () => {
        // Check if there's a referrer in location state
        if (location.state?.from) {
            navigate(location.state.from);
        } else {
            // Default to home
            navigate('/');
        }
    };

    const handleImageDownload = async (imageUrl) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            await downloadBlob(blob, `crittertrack-image-${Date.now()}.jpg`);
        } catch (error) {
            console.error('Failed to download image:', error);
        }
    };

    useEffect(() => {
        const fetchAnimal = async () => {
            try {
                // First try to fetch from public animals
                const response = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${animalId}`);
                if (response.data?.[0]) {
                    setAnimal(response.data[0]);
                    setLoading(false);
                    return;
                }
                
                // If not found in public, try to fetch from private to determine if it's private or truly not found
                if (authToken) {
                    try {
                        const privateResponse = await axios.get(
                            `${API_BASE_URL}/animals/${animalId}`,
                            { headers: { Authorization: `Bearer ${authToken}` } }
                        );
                        if (privateResponse.data) {
                            // Animal exists but is private
                            setIsPrivate(true);
                            setLoading(false);
                            return;
                        }
                    } catch (error) {
                        // Not found in private either, it's truly not found
                    }
                }
                
                // Truly not found
                setNotFound(true);
                setLoading(false);
            } catch (error) {
                console.error('Animal not found or not public:', error);
                setNotFound(true);
                setLoading(false);
            }
        };
        fetchAnimal();
    }, [animalId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-page-bg dark:bg-dark-bg flex items-center justify-center p-6">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (isPrivate) {
        return (
            <div className="min-h-screen bg-page-bg dark:bg-dark-bg flex flex-col items-center p-6">
                <header className="w-full max-w-7xl bg-white dark:bg-dark-card-bg p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                    <CustomAppLogo size="w-10 h-10" />
                    <button
                        onClick={handleGoBack}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                    >
                        Home
                    </button>
                </header>
                <PrivateAnimalScreen onBack={handleGoBack} />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-page-bg dark:bg-dark-bg flex flex-col items-center justify-center p-6">
                <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-lg p-8 max-w-md text-center">
                    <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Animal Not Found</h1>
                    <p className="text-gray-600 mb-6"> {/* Changed from creatorId_public to creatorId_public */}
                        This animal either doesn't exist or is not publicly visible.
                    </p>
                    <button
                        onClick={handleGoBack}
                        className="w-full px-4 py-2 bg-primary dark:bg-dark-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
                    >
                        Login / Register
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-page-bg dark:bg-dark-bg flex flex-col items-center p-6">
            <header className="w-full max-w-7xl bg-white dark:bg-dark-card-bg p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                <CustomAppLogo size="w-10 h-10" />
                <button
                    onClick={handleGoBack}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                    Home
                </button>
            </header>
            <ViewAnimalModalV2
                animal={animal}
                mode="public"
                onClose={handleGoBack}
                API_BASE_URL={API_BASE_URL}
                authToken={authToken}
                onViewProfile={(user) => navigate(`/user/${user.id_public}`)}
                onViewAnimal={(animal) => navigate(`/animal/${animal.id_public}`)}
                setShowImageModal={setShowImageModal}
                setEnlargedImageUrl={setEnlargedImageUrl}
            />
            
            {/* Image Modal */}
            {showImageModal && enlargedImageUrl && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[90] p-4"
                    onClick={() => setShowImageModal(false)}
                >
                    <div className="relative max-w-7xl max-h-full flex flex-col items-center gap-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowImageModal(false);
                            }}
                            className="self-end text-white hover:text-gray-300 transition"
                        >
                            <X size={32} />
                        </button>
                        <img 
                            src={enlargedImageUrl} 
                            alt="Enlarged view" 
                            className="max-w-full max-h-[75vh] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleImageDownload(enlargedImageUrl);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
                        >
                            <Download size={20} />
                            Download Image
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

// Public Profile Page Component
const PublicProfilePage = ({ onOpenMessages }) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Check if user is logged in and in moderator mode
    const authToken = localStorage.getItem('authToken');
    const [userProfile, setUserProfile] = useState(null);
    const [modCurrentContext, setModCurrentContext] = useState(null);

    useEffect(() => {
        // Fetch current user profile if authenticated
        const fetchUserProfile = async () => {
            if (authToken) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    setUserProfile(response.data);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
        };
        fetchUserProfile();
    }, [authToken]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/public/profile/${userId}`);
                setProfile(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Profile not found or not public:', error);
                setNotFound(true);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-page-bg dark:bg-dark-bg flex items-center justify-center p-6">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-page-bg dark:bg-dark-bg flex flex-col items-center justify-center p-6">
                <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-lg p-8 max-w-md text-center">
                    <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        This profile either doesn't exist or is not publicly visible.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full px-4 py-2 bg-primary dark:bg-dark-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
                    >
                        {authToken ? 'Go to Dashboard' : 'Login / Register'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-page-bg dark:bg-dark-bg flex flex-col items-center p-6">
            <header className="w-full max-w-7xl bg-white dark:bg-dark-card-bg p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                <CustomAppLogo size="w-10 h-10" />
                <button
                    onClick={() => navigate('/')}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                    {authToken ? 'Dashboard' : 'Home'}
                </button>
            </header>
            <PublicProfileView
                profile={profile}
                onBack={() => navigate(-1)}
                onViewAnimal={(animal) => navigate(`/animal/${animal.id_public}`, { state: { from: `/user/${userId}` } })}
                API_BASE_URL={API_BASE_URL}
                authToken={authToken}
                setModCurrentContext={setModCurrentContext}
                currentUserIdPublic={userProfile?.id_public}
                currentUserRole={userProfile?.role}
                onStartMessage={authToken ? () => {
                    // Open the Messages modal directly with this profile's conversation,
                    // without navigating away from the public profile page.
                    if (onOpenMessages) {
                        onOpenMessages({
                            otherUserId: profile.userId_backend || profile.id_public,
                            otherUser: {
                                id_public: profile.id_public,
                                personalName: profile.personalName,
                                breederName: profile.breederName,
                                showPersonalName: profile.showPersonalName,
                                showBreederName: profile.showBreederName,
                                profileImage: profile.profileImage
                            }
                        });
                    } else {
                        // Fallback for contexts where the modal can't be opened directly
                        navigate(`/?message=${profile.id_public}`);
                    }
                } : null}
            />
        </div>
    );
};

// Standalone Privacy Policy page — same content as the login-flow PrivacyPolicy modal,
// but at its own public URL (no auth, no modal backdrop) so it can be linked from the
// Play Store listing / app store metadata, which requires a directly-loadable page.
const PrivacyPolicyPage = () => {
    const navigate = useNavigate();
    const authToken = localStorage.getItem('authToken');

    return (
        <div className="min-h-screen bg-page-bg dark:bg-dark-bg flex flex-col items-center p-6">
            <header className="w-full max-w-4xl bg-white dark:bg-dark-card-bg p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                <CustomAppLogo size="w-10 h-10" />
                <button
                    onClick={() => navigate('/')}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                    {authToken ? 'Dashboard' : 'Home'}
                </button>
            </header>
            <div className="bg-white dark:bg-dark-card-bg rounded-xl shadow-2xl max-w-4xl w-full mb-8">
                <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text">Privacy Policy</h1>
                </div>

                <div className="p-6 space-y-6 text-gray-700 dark:text-dark-text-secondary">
                    <p className="text-sm text-gray-500 dark:text-dark-text-muted">Last Updated: December 7, 2025</p>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-3">1. Information We Collect</h2>
                        <p className="mb-2">We collect the following types of information:</p>
                        <ul className="list-disc ml-6 space-y-2">
                            <li><strong>Account Information:</strong> Email address, personal name, breeder name</li>
                            <li><strong>Profile Information:</strong> Profile images, breeder information, public display preferences</li>
                            <li><strong>Animal Records:</strong> Animal data, photos, pedigree information, genetic codes</li>
                            <li><strong>Usage Data:</strong> Pages visited, features used, feedback submissions</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-3">2. How We Use Your Information</h2>
                        <p className="mb-2">We use your information to:</p>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>Provide and maintain the CritterTrack service</li>
                            <li>Create and manage your account</li>
                            <li>Store and display your animal records and pedigrees</li>
                            <li>Send you important account notifications (email verification, password resets)</li>
                            <li>Respond to your feedback and support requests</li>
                            <li>Improve our services and develop new features</li>
                            <li>Prevent fraud and ensure service security</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-3">3. Information Sharing and Public Data</h2>
                        <ul className="list-disc ml-6 space-y-2">
                            <li><strong>Public Profiles:</strong> If you enable "Show Public Profile," your breeder name and selected animals may be visible to other users</li>
                            <li><strong>Public Animals:</strong> Animals marked as "Display" may appear in public searches</li>
                            <li><strong>Private by Default:</strong> Your email address and personal information are never publicly displayed</li>
                            <li><strong>No Third-Party Selling:</strong> We do not sell your personal information to third parties</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-3">4. Data Storage and Security</h2>
                        <p>
                            Your data is stored securely on MongoDB Atlas cloud database with encryption. We use industry-standard
                            security measures including password hashing, JWT authentication, and HTTPS encryption. However, no method
                            of transmission over the internet is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-3">5. Email Communications</h2>
                        <p className="mb-2">We send emails for:</p>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>Email verification during registration</li>
                            <li>Password reset requests</li>
                            <li>Important account or service updates</li>
                        </ul>
                        <p className="mt-2">
                            We do not send marketing emails. All service emails are sent from noreply@crittertrack.net.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-3">6. Cookies and Tracking</h2>
                        <p>
                            We use localStorage to store your authentication token for login persistence. We do not use third-party
                            tracking cookies or analytics services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-3">7. Your Rights</h2>
                        <p className="mb-2">You have the right to:</p>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>Access your personal information through your profile</li>
                            <li>Update or correct your information at any time</li>
                            <li>Delete your account and associated data</li>
                            <li>Control public visibility of your profile and animals</li>
                            <li>Request a copy of your data</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-3">8. Data Retention</h2>
                        <p>
                            We retain your data for as long as your account is active. If you delete your account, we will delete
                            your personal information within 30 days. Some data may be retained for legal or security purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-3">9. Children's Privacy</h2>
                        <p>
                            CritterTrack is intended for users 13 years and older. We do not knowingly collect information from
                            children under 13. If you believe we have collected such information, please contact us immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-3">10. Third-Party Services</h2>
                        <p className="mb-2">We use the following third-party services:</p>
                        <ul className="list-disc ml-6 space-y-2">
                            <li><strong>MongoDB Atlas:</strong> Database hosting (data stored securely in the cloud)</li>
                            <li><strong>Railway:</strong> Backend server hosting</li>
                            <li><strong>Vercel:</strong> Frontend hosting</li>
                            <li><strong>Resend:</strong> Transactional email delivery</li>
                        </ul>
                        <p className="mt-2">
                            These services have their own privacy policies and security measures.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-3">11. Changes to Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of significant changes by
                            email or through the service. Continued use after changes constitutes acceptance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-3">12. Contact Us</h2>
                        <p>
                            If you have questions about this Privacy Policy or how we handle your data, please contact us at{' '}
                            <a href="mailto:crittertrackowner@gmail.com" className="text-primary hover:underline">
                                crittertrackowner@gmail.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

// Router Wrapper Component
export { PublicAnimalPage, PublicProfilePage, PrivacyPolicyPage };
