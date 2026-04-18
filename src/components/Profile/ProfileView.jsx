import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Edit, Loader2, QrCode, RefreshCw, Settings, Users } from 'lucide-react';
import { QRModal } from '../PublicProfile/PublicProfileView';
import ProfileEditForm from './ProfileEditForm';
import UserProfileCard from './UserProfileCard';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin text-primary-dark mr-2" size={24} />
    <span className="text-gray-600">Loading...</span>
  </div>
);

const ProfileView = ({ userProfile, showModalMessage, fetchUserProfile, authToken, onProfileUpdated, onProfileEditButtonClicked, breedingLineDefs, animalBreedingLines, saveBreedingLineDefs, toggleAnimalBreedingLine, BL_PRESETS_APP }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [checkingForUpdates, setCheckingForUpdates] = useState(false);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    // Note: Donation button is now globally available via fixed button in top-left corner

    const handleShare = () => {
        const url = `${window.location.origin}/user/${userProfile.id_public}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handleCheckForUpdates = async () => {
        setCheckingForUpdates(true);
        setUpdateAvailable(false);
        
        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    console.log('[ProfileView] Manually checking for service worker updates...');
                    await registration.update();
                    console.log('[ProfileView] Update check complete');
                    
                    // Set up listener for update found event
                    const handleUpdateAvailable = () => {
                        console.log('[ProfileView] Update is available!');
                        setUpdateAvailable(true);
                        showModalMessage('Update Available', 'A new version of CritterTrack is available. Please refresh the page to update.');
                        // Remove listener after it fires
                        window.removeEventListener('sw-update-available', handleUpdateAvailable);
                    };
                    
                    window.addEventListener('sw-update-available', handleUpdateAvailable);
                    
                    // Check if update was already found (SW_UPDATE_AVAILABLE flag)
                    if (window.SW_UPDATE_AVAILABLE) {
                        handleUpdateAvailable();
                    }
                    
                    showModalMessage('Check Complete', 'CritterTrack is up to date. You\'re running the latest version!');
                } else {
                    showModalMessage('Error', 'Service worker is not installed. Please refresh the page.');
                }
            }
        } catch (error) {
            console.error('[ProfileView] Error checking for updates:', error);
            showModalMessage('Error', 'Failed to check for updates. Please try again later.');
        } finally {
            setCheckingForUpdates(false);
        }
    };

    if (!userProfile) return <LoadingSpinner />;

    if (isEditing) {
        return (
            <ProfileEditForm 
                userProfile={userProfile} 
                showModalMessage={showModalMessage} 
                onSaveSuccess={(updatedUser) => { 
                    if (updatedUser && typeof onProfileUpdated === 'function') {
                        onProfileUpdated(updatedUser);
                    } else {
                        fetchUserProfile(authToken);
                    }
                    setIsEditing(false);
                }} 
                onCancel={() => setIsEditing(false)} 
                authToken={authToken}
                breedingLineDefs={breedingLineDefs}
                animalBreedingLines={animalBreedingLines}
                saveBreedingLineDefs={saveBreedingLineDefs}
                toggleAnimalBreedingLine={toggleAnimalBreedingLine}
                BL_PRESETS_APP={BL_PRESETS_APP}
            />
        );
    }

    return (
        <div className="w-full max-w-7xl bg-white p-3 sm:p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800 flex items-center">
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary-dark" />
                    Profile Settings
                </h2>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                        onClick={() => setShowQR(true)}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                    >
                        <QrCode className="w-4 h-4" />
                        Share
                    </button>
                    {showQR && <QRModal url={`${window.location.origin}/user/${userProfile.id_public}`} title="My Public Profile" onClose={() => setShowQR(false)} />}
                </div>
            </div>
            <div className="space-y-3 sm:space-y-4 overflow-x-hidden">
                
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-x-hidden">
                    <p className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Public Visibility Status</p>
                    
                    <div className="flex justify-between items-center gap-2 py-1.5 sm:py-2">
                        <span className="text-xs sm:text-sm text-gray-800 truncate flex-1">Personal Name</span>
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap ${ 
                            (userProfile.showPersonalName ?? true) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showPersonalName ?? true) ? 'Public' : 'Private'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center gap-2 py-1.5 sm:py-2">
                        <span className="text-xs sm:text-sm text-gray-800 truncate flex-1">Breeder Name</span>
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap ${ 
                            (userProfile.showBreederName ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showBreederName ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center gap-2 py-1.5 sm:py-2">
                        <span className="text-xs sm:text-sm text-gray-800 truncate flex-1">Website URL</span>
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap ${ 
                            (userProfile.showWebsiteURL ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showWebsiteURL ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center gap-2 py-1.5 sm:py-2">
                        <span className="text-xs sm:text-sm text-gray-800 truncate flex-1">Social Media Link</span>
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap ${ 
                            (userProfile.showSocialMediaURL ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showSocialMediaURL ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center gap-2 py-1.5 sm:py-2">
                        <span className="text-xs sm:text-sm text-gray-800 truncate flex-1">Bio</span>
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap ${ 
                            (userProfile.showBio ?? true) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showBio ?? true) ? 'Public' : 'Private'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center gap-2 py-1.5 sm:py-2">
                        <span className="text-xs sm:text-sm text-gray-800 truncate flex-1">Stats Tab</span>
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap ${ 
                            (userProfile.showStatsTab ?? true) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showStatsTab ?? true) ? 'Visible' : 'Hidden'}
                        </span>
                    </div>

                    <div className="flex justify-between items-center gap-2 py-1.5 sm:py-2">
                        <span className="text-sm sm:text-base text-gray-800 truncate">Messages</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                            (userProfile.allowMessages === true) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.allowMessages === true) ? 'Allowed' : 'Disabled'}
                        </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-2">
                        <span className="text-sm sm:text-base text-gray-800 truncate">Email Address ({userProfile.email})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${ 
                            (userProfile.showEmailPublic ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showEmailPublic ?? false) ? 'Public' : 'Private'}
                        </span>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-x-hidden" data-tutorial-target="personal-id-section">
                    <p className="text-lg font-semibold text-gray-700">Personal ID:</p>
                    <p className="text-2xl sm:text-3xl font-extrabold text-accent truncate">{userProfile.id_public}</p>
                </div>
            </div>
            
            <button 
                onClick={() => {
                    setIsEditing(true);
                    if (typeof onProfileEditButtonClicked === 'function') onProfileEditButtonClicked(true);
                }}
                data-tutorial-target="profile-edit-btn"
                className="mt-6 bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 shadow-md flex items-center"
            >
                <Edit size={20} className="mr-2" /> Edit Profile
            </button>
            

            <button 
                onClick={handleCheckForUpdates}
                disabled={checkingForUpdates}
                className="mt-3 bg-primary hover:bg-primary/90 text-black font-semibold py-3 px-6 rounded-lg transition duration-150 shadow-md flex items-center disabled:opacity-50"
            >
                {checkingForUpdates ? (
                    <>
                        <Loader2 size={20} className="mr-2 animate-spin" /> Checking for Updates...
                    </>
                ) : updateAvailable ? (
                    <>
                        <CheckCircle size={20} className="mr-2 text-green-600" /> Update Available!
                    </>
                ) : (
                    <>
                        <RefreshCw size={20} className="mr-2" /> Check for Updates
                    </>
                )}
            </button>
            
            {userProfile?.id_public === 'CTU2' && (
                <button 
                    onClick={() => navigate('/family-tree')}
                    className="mt-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 shadow-md flex items-center"
                >
                    <Users size={20} className="mr-2" /> Family Tree (Testing)
                </button>
            )}
        </div>
    );
};

// -- Module-level cache so AnimalList survives unmount/remount without refetching --
let _alCache = null;       // last animals array

// Keep cache patched even while AnimalList is unmounted
if (!window.__alCacheListenerAttached) {
    window.__alCacheListenerAttached = true;
    window.addEventListener('animal-updated', (e) => {
        const u = e.detail;
        if (_alCache && u?.id_public) {
            _alCache = _alCache.map(a => a.id_public === u.id_public ? { ...a, ...u } : a);
        }
    });
    window.addEventListener('animals-changed', () => { _alCache = null; }); // bust on full reload signal
}


// Messages View Component

export default ProfileView;
