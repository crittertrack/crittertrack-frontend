import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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

    if (!userProfile) return <LoadingSpinner />;

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
            }}
            onCancel={() => navigate(`/user/${userProfile.id_public}`)}
            authToken={authToken}
            breedingLineDefs={breedingLineDefs}
            animalBreedingLines={animalBreedingLines}
            saveBreedingLineDefs={saveBreedingLineDefs}
            toggleAnimalBreedingLine={toggleAnimalBreedingLine}
            BL_PRESETS_APP={BL_PRESETS_APP}
        />
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
