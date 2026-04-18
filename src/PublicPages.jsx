import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Loader2, XCircle, Download, X, Lock } from 'lucide-react';
import CustomAppLogo from './components/shared/CustomAppLogo';
import ViewOnlyAnimalDetail from './components/AnimalDetail/ViewOnlyAnimalDetail';
import PublicProfileView from './components/PublicProfile/PublicProfileView';
import ModeratorActionSidebar from './components/moderation/ModeratorActionSidebar';
const API_BASE_URL = '/api';

const PrivateAnimalScreen = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                <Lock size={64} className="text-gray-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">This Animal is Private</h1>
                <p className="text-gray-600 mb-6">
                    This animal doesn't have a public profile available. The owner has not shared this animal publicly.
                </p>
                <button
                    onClick={onBack}
                    className="w-full px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
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
    const [modCurrentContext, setModCurrentContext] = useState(null);
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
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `crittertrack-image-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
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
            <div className="min-h-screen bg-page-bg flex items-center justify-center p-6">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (isPrivate) {
        return (
            <div className="min-h-screen bg-page-bg flex flex-col items-center p-6">
                <header className="w-full max-w-7xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
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
            <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Animal Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        This animal either doesn't exist or is not publicly visible.
                    </p>
                    <button
                        onClick={handleGoBack}
                        className="w-full px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
                    >
                        Login / Register
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-page-bg flex flex-col items-center p-6">
            <header className="w-full max-w-7xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                <CustomAppLogo size="w-10 h-10" />
                <button
                    onClick={handleGoBack}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                    Home
                </button>
            </header>
            <ViewOnlyAnimalDetail
                animal={animal}
                onClose={handleGoBack}
                onCloseAll={handleGoBack}
                API_BASE_URL={API_BASE_URL}
                authToken={authToken}
                onViewProfile={(user) => navigate(`/user/${user.id_public}`)}
                onViewAnimal={(animal) => navigate(`/animal/${animal.id_public}`)}
                setModCurrentContext={setModCurrentContext}
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
            
            {/* Moderator Action Sidebar - disabled, use mod panel instead */}
            {false && inModeratorMode && (
                <ModeratorActionSidebar
                    isActive={true}
                    onOpenReportQueue={() => navigate('/')}
                    onQuickFlag={(flagData) => {
                    }}
                    onExitModeration={() => {
                        localStorage.removeItem('moderationAuthenticated');
                        navigate('/');
                    }}
                    currentPage={location.pathname}
                    currentContext={modCurrentContext}
                />
            )}
        </div>
    );
};

// Public Profile Page Component
const PublicProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '' });

    // Check if user is logged in and in moderator mode
    const authToken = localStorage.getItem('authToken');
    const inModeratorMode = localStorage.getItem('moderationAuthenticated') === 'true';
    const [userProfile, setUserProfile] = useState(null);
    const [modCurrentContext, setModCurrentContext] = useState(null);

    const showModalMessage = (title, message) => {
        setModalContent({ title, message });
        setShowModal(true);
    };

    const handleModQuickFlag = useCallback(async (flagData) => {
        try {

            // Handle different action types
            if (flagData.action === 'flag') {
                // Create a report for flagged content
                const reportType = flagData.context?.type === 'profile' ? 'profile' : 
                                  flagData.context?.type === 'animal' ? 'animal' : 'message';
                
                // Get the correct user ID based on context type
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                const reportData = {
                    reason: flagData.reason,
                    category: flagData.category,
                    description: `Moderator flag: ${flagData.reason}`,
                    reportedContentId: flagData.context?.id,
                    reportedUserId: userId,
                    isModeratorReport: true
                };

                await axios.post(
                    `${API_BASE_URL}/reports/${reportType}`,
                    reportData,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                showModalMessage('Flag Submitted', 'Content has been flagged and added to the report queue.');
            } 
            else if (flagData.action === 'edit') {
                // Edit/redact content fields
                const contentType = flagData.context?.type;
                const contentId = flagData.context?.id;
                
                await axios.patch(
                    `${API_BASE_URL}/moderation/content/${contentType}/${contentId}/edit`,
                    {
                        fieldEdits: flagData.fieldEdits,
                        reason: flagData.reason
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                showModalMessage('Content Edited', 'Content has been updated successfully.');
                // Refresh the current view
                window.location.reload();
            }
            else if (flagData.action === 'warn') {
                // Warn user - get correct user ID based on context type
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                const response = await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/warn`,
                    {
                        reason: flagData.reason,
                        category: flagData.category
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                showModalMessage('Warning Sent', `User has been warned. Total warnings: ${response.data.warningCount}`);
            }
            else if (flagData.action === 'suspend') {
                // Suspend user - get correct user ID based on context type
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/status`,
                    {
                        status: 'suspended',
                        reason: flagData.reason,
                        durationDays: flagData.durationDays
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                showModalMessage('User Suspended', `User has been suspended for ${flagData.durationDays} days.`);
            }
            else if (flagData.action === 'ban') {
                // Ban user - get correct user ID based on context type
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/status`,
                    {
                        status: 'banned',
                        reason: flagData.reason,
                        ipBan: flagData.ipBan
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                showModalMessage('User Banned', 'User has been permanently banned.');
            }
            else if (flagData.action === 'lift-warning') {
                // Lift warning from user
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                const response = await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/lift-warning`,
                    {
                        reason: flagData.reason,
                        warningIndex: flagData.warningIndex
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                showModalMessage('Warning Lifted', `User's warning count is now ${response.data.warningCount}.`);
            }
            else if (flagData.action === 'lift-suspension') {
                // Lift suspension from user
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/status`,
                    {
                        status: 'active',
                        reason: flagData.reason
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                showModalMessage('Suspension Lifted', 'User account has been reactivated and can now log in.');
            }
            else if (flagData.action === 'lift-ban') {
                // Lift ban from user
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/status`,
                    {
                        status: 'active',
                        reason: flagData.reason
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                showModalMessage('Ban Lifted', 'User account has been unbanned and can now log in.');
            }
        } catch (error) {
            console.error('[MOD ACTION] ERROR OCCURRED:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                errorData: error.response?.data,
                errorResponse: error.response,
                fullError: error
            });
            
            // Extract error message for user feedback
            const errorMsg = error.response?.data?.message 
                || error.response?.data?.error 
                || error.message 
                || 'An error occurred while performing this action.';
            
            console.error('[MOD ACTION] Showing error message to user:', errorMsg);
            showModalMessage('Action Failed', errorMsg);
        }
    }, [authToken]);


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
            <div className="min-h-screen bg-page-bg flex items-center justify-center p-6">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        This profile either doesn't exist or is not publicly visible.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
                    >
                        {authToken ? 'Go to Dashboard' : 'Login / Register'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-page-bg flex flex-col items-center p-6">
            <header className="w-full max-w-7xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
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
                    // Navigate to dashboard with message param to open conversation
                    navigate(`/?message=${profile.id_public}`);
                } : null}
            />
            
            {/* Moderator Action Sidebar - disabled, use mod panel instead */}
            {false && inModeratorMode && localStorage.getItem('moderationAuthenticated') === 'true' && (
                <ModeratorActionSidebar
                    isActive={true}
                    onOpenReportQueue={() => navigate('/')}
                    onQuickFlag={(flagData) => {
                        handleModQuickFlag(flagData);
                    }}
                    onExitModeration={() => {
                        localStorage.removeItem('moderationAuthenticated');
                        window.location.href = '/';
                    }}
                    currentPage={window.location.pathname}
                    currentContext={modCurrentContext}
                    API_BASE_URL={API_BASE_URL}
                    authToken={authToken}
                />
            )}
            
            {/* Modal for moderation action feedback */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">{modalContent.title}</h2>
                        <p className="text-gray-600 mb-6">{modalContent.message}</p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Router Wrapper Component
export { PublicAnimalPage, PublicProfilePage };
