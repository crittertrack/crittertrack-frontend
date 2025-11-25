import React, { useState, useEffect, useCallback, useRef } from 'react'; // Import useRef
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, Trash2, Edit, Save, PlusCircle, ArrowLeft, Loader2, RefreshCw, User, ClipboardList, BookOpen, Settings, Mail, Globe, Egg, Milk } from 'lucide-react';

// --- Global Constants ---
const API_BASE_URL = 'https://crittertrack-pedigree-production.up.railway.app/api';

const SPECIES_OPTIONS = ['Mouse', 'Rat', 'Hamster'];
const GENDER_OPTIONS = ['Male', 'Female'];
const STATUS_OPTIONS = ['Pet', 'Breeding', 'Available', 'Retired', 'Deceased'];

// --- NEW GLOBAL CONSTANT FOR IDLE TIMEOUT ---
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

// --- Helper Components ---

// Simple message box to replace alerts and confirmation prompts
const ModalMessage = ({ title, message, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <button 
        onClick={onClose} 
        className="w-full bg-primary hover:bg-primary/80 text-black font-semibold py-2 rounded-lg transition duration-150 shadow-md"
      >
        Close
      </button>
    </div>
  </div>
);

// Custom logo component updated to render an image from the public folder
const CustomAppLogo = ({ size = "w-10 h-10" }) => (
  // The size is controlled by the 'size' prop.
  <img 
    src="/logo.png" 
    // UPDATED: CritterTrack -> Crittertrack
    alt="Crittertrack Logo" 
    className={`${size} shadow-md`} 
  />
);

// Loading Indicator
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin text-primary-dark mr-2" size={24} />
    <span className="text-gray-600">Loading...</span>
  </div>
);

// --- Component: Profile Image Placeholder ---
const ProfileImagePlaceholder = ({ url, onFileChange, disabled }) => (
    <div className="flex flex-col items-center space-y-3">
        <div 
            // UPDATED: Changed rounded-full to rounded-lg
            className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden shadow-inner cursor-pointer" 
            onClick={() => !disabled && document.getElementById('profileImageInput').click()}
        >
            {url ? (
                <img src={url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                <User size={50} />
            )}
        </div>
        <input 
            id="profileImageInput" 
            type="file" 
            accept="image/*" 
            hidden 
            onChange={onFileChange} 
            disabled={disabled}
        />
        <button 
            type="button" 
            onClick={() => !disabled && document.getElementById('profileImageInput').click()}
            disabled={disabled}
            className="text-sm text-primary hover:text-primary-dark transition duration-150 disabled:opacity-50"
        >
            {url ? "Change Image" : "Upload Image"}
        </button>
    </div>
);

// --- Component: Profile Edit Form (New) ---
const ProfileEditForm = ({ userProfile, showModalMessage, onSaveSuccess, onCancel, authToken }) => {
    // Form states for profile data (to be sent to /users/profile)
    const [personalName, setPersonalName] = useState(userProfile.personalName);
    const [breederName, setBreederName] = useState(userProfile.breederName || '');
    
    // Existing Toggles
    const [showPersonalName, setShowPersonalName] = useState(userProfile.showPersonalName ?? true); 
    const [showBreederName, setShowBreederName] = useState(userProfile.showBreederName ?? false); 
    
    // NEW STATES
    const [websiteURL, setWebsiteURL] = useState(userProfile.websiteURL || '');
    const [showWebsiteURL, setShowWebsiteURL] = useState(userProfile.showWebsiteURL ?? false);
    // FIX: Using ?? false for robust initialization if the field is missing
    const [showEmailPublic, setShowEmailPublic] = useState(userProfile.showEmailPublic ?? false); 

    const [profileImageFile, setProfileImageFile] = useState(null); // File state for image upload (placeholder)
    const [profileImageURL, setProfileImageURL] = useState(null); // URL for preview (or null for default)
    const [profileLoading, setProfileLoading] = useState(false);

    // Form states for security data (separate updates)
    const [email, setEmail] = useState(userProfile.email);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [securityLoading, setSecurityLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Helper for profile image preview
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImageFile(file);
            setProfileImageURL(URL.createObjectURL(file));
        }
    };

    // 1. Handle Profile Info Update (Personal Name, Breeder Name, Image, and Visibility)
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        
        const payload = {
            personalName: personalName,
            breederName: breederName || null,
            showPersonalName: showPersonalName,
            showBreederName: showBreederName,
            // NEW FIELDS
            websiteURL: websiteURL || null,
            showWebsiteURL: websiteURL ? showWebsiteURL : false, // Only show if URL is provided
            showEmailPublic: showEmailPublic, // This sends the boolean state
        };

        try {
            await axios.put(`${API_BASE_URL}/users/profile`, payload, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'Profile information updated successfully.');
            await onSaveSuccess(); // Refresh user profile data in App
        } catch (error) {
            console.error('Profile Update Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || 'Failed to update profile information.');
        } finally {
            setProfileLoading(false);
        }
    };

    // 2. Handle Email Update
    const handleEmailUpdate = async (e) => {
        e.preventDefault();
        if (email === userProfile.email) {
            showModalMessage('Info', 'Email is already set to this value.');
            return;
        }

        setSecurityLoading(true);
        try {
            // Assuming an endpoint for email change exists
            await axios.put(`${API_BASE_URL}/auth/change-email`, { newEmail: email }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Email Changed', 'Your email has been updated. You may need to log in again with the new email.');
            await onSaveSuccess(); // Refresh user profile data in App
        } catch (error) {
            console.error('Email Update Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || 'Failed to update email address.');
            setEmail(userProfile.email); // Revert on failure
        } finally {
            setSecurityLoading(false);
        }
    };
    
    // 3. Handle Password Update
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showModalMessage('Warning', 'All password fields are required to change your password.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            showModalMessage('Warning', 'New password and confirmation do not match.');
            return;
        }

        setPasswordLoading(true);
        try {
            // Assuming an endpoint for password change exists
            await axios.put(`${API_BASE_URL}/auth/change-password`, { currentPassword, newPassword }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'Your password has been changed successfully. You will need to re-login with the new password.');
            
            // Clear fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');

        } catch (error) {
            console.error('Password Update Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || 'Failed to change password. Check your current password.');
        } finally {
            setPasswordLoading(false);
        }
    };


    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Settings size={24} className="mr-3 text-primary-dark" />
                    Edit Profile
                </h2>
                <button
                    onClick={onCancel}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition"
                    disabled={profileLoading || securityLoading || passwordLoading}
                >
                    <ArrowLeft size={18} className="mr-1" /> Back to Profile
                </button>
            </div>


            {/* 1. Personal & Breeder Info Form */}
            <form onSubmit={handleProfileUpdate} className="mb-8 p-4 border border-gray-200 rounded-lg space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">General Information</h3>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
                    <ProfileImagePlaceholder 
                        url={profileImageURL} 
                        onFileChange={handleImageChange}
                        disabled={profileLoading}
                    />

                    <div className="flex-grow space-y-4 w-full">
                        <input
                            type="text"
                            placeholder="Personal Name *"
                            value={personalName}
                            onChange={(e) => setPersonalName(e.target.value)}
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                            disabled={profileLoading}
                        />
                        <input
                            type="text"
                            placeholder="Breeder Name (Optional)"
                            value={breederName}
                            onChange={(e) => setBreederName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                            disabled={profileLoading}
                        />
                        
                        {/* NEW: Website URL input */}
                        <input
                            type="url"
                            name="websiteURL"
                            placeholder="Website URL (Optional) e.g., https://example.com"
                            value={websiteURL}
                            onChange={(e) => setWebsiteURL(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                            disabled={profileLoading}
                        />


                        {/* VISIBILITY TOGGLES */}
                        <div className="pt-2 space-y-2">
                            <h4 className="text-base font-medium text-gray-800 pt-2 border-t border-gray-200">Public Profile Visibility:</h4>
                            
                            {/* Personal Name Toggle */}
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={showPersonalName}
                                    onChange={(e) => setShowPersonalName(e.target.checked)}
                                    className="rounded text-primary-dark focus:ring-primary-dark"
                                    disabled={profileLoading}
                                />
                                <span>Display **Personal Name** on your public profile card.</span>
                            </label>
                            
                            {/* Breeder Name Toggle */}
                            {breederName && (
                                <label className="flex items-center space-x-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={showBreederName}
                                        onChange={(e) => setShowBreederName(e.target.checked)}
                                        className="rounded text-primary-dark focus:ring-primary-dark"
                                        disabled={profileLoading}
                                    />
                                    <span>Display **Breeder Name** on your public profile card.</span>
                                </label>
                            )}
                            
                            {/* NEW: Email Public Toggle */}
                            <label className="flex items-center space-x-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={showEmailPublic}
                                    onChange={(e) => setShowEmailPublic(e.target.checked)}
                                    className="rounded text-primary-dark focus:ring-primary-dark"
                                    disabled={profileLoading}
                                />
                                <span>Display **Email Address** on your public profile card.</span>
                            </label>

                            {/* NEW: Website URL Toggle */}
                            {websiteURL && (
                                <label className="flex items-center space-x-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={showWebsiteURL}
                                        onChange={(e) => setShowWebsiteURL(e.target.checked)}
                                        className="rounded text-primary-dark focus:ring-primary-dark"
                                        disabled={profileLoading}
                                    />
                                    <span>Display **Website URL** on your public profile card.</span>
                                </label>
                            )}
                        </div>
                        
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {profileLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                        Save Profile Info
                    </button>
                </div>
            </form>
            
            {/* 2. Email Update Form */}
            <form onSubmit={handleEmailUpdate} className="mb-8 p-4 border border-gray-200 rounded-lg space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Change Email</h3>
                <input
                    type="email"
                    placeholder="New Email Address *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                    disabled={securityLoading}
                />
                
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={securityLoading}
                        className="bg-primary-dark hover:bg-primary text-black font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {securityLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <RefreshCw size={20} className="mr-2" />}
                        Update Email
                    </button>
                </div>
            </form>
            
            {/* 3. Password Update Form */}
            <form onSubmit={handlePasswordUpdate} className="mb-8 p-4 border border-gray-200 rounded-lg space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
                <input
                    type="password"
                    placeholder="Current Password *"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                    disabled={passwordLoading}
                />
                <input
                    type="password"
                    placeholder="New Password *"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                    disabled={passwordLoading}
                />
                <input
                    type="password"
                    placeholder="Confirm New Password *"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary transition"
                    disabled={passwordLoading}
                />
                
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="bg-primary-dark hover:bg-primary text-black font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {passwordLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                        Set New Password
                    </button>
                </div>
            </form>

        </div>
    );
};


// --- Component: User Profile Card (Existing, placed on Dashboard) ---
const UserProfileCard = ({ userProfile }) => {
    if (!userProfile) return null;

    const formattedCreationDate = userProfile.createdAt 
        ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(userProfile.createdAt))
        : 'N/A';
    
    // Placeholder for profile image
    const ProfileImage = () => (
        // UPDATED: Changed rounded-full to rounded-lg
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden shadow-inner">
            <User size={40} />
        </div>
    );

    // Get visibility status, defaulting to true for personal name if fields are new/null
    const isPersonalNameVisible = userProfile.showPersonalName ?? true;
    const isBreederNameVisible = userProfile.showBreederName ?? false;


    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg mb-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <ProfileImage />

            <div className="flex-grow text-center sm:text-left">
                
                {/* Personal Name */}
                {isPersonalNameVisible && (
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        {userProfile.personalName}
                    </h3>
                )}
                
                {/* Breeder Name (Removed 'Breeder Name:' title) */}
                {(isBreederNameVisible && userProfile.breederName) && (
                    <div className="text-xl text-gray-700 font-semibold">
                        {userProfile.breederName}
                    </div>
                )}

                {/* Fallback if both names are hidden */}
                {(!isPersonalNameVisible && !isBreederNameVisible) && (
                    <h3 className="text-2xl font-bold text-gray-500 mb-2">
                        (Name Hidden)
                    </h3>
                )}

                {/* NEW: Contact Info (Email and Website) */}
                <div className="mt-4 space-y-1 text-sm text-gray-700">
                    {/* Email */}
                    {/* FIX: Use ?? false to ensure reliable rendering if the field is initially missing from the profile object */}
                    {((userProfile.showEmailPublic ?? false)) && (
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <Mail size={16} className="text-gray-500" />
                            <a href={`mailto:${userProfile.email}`} className="text-gray-700 hover:text-primary transition duration-150">
                                {userProfile.email}
                            </a>
                        </div>
                    )}
                    
                    {/* Website */}
                    {(userProfile.websiteURL && userProfile.showWebsiteURL) && (
                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <Globe size={16} className="text-gray-500" />
                            <a 
                                href={userProfile.websiteURL} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-primary-dark hover:underline transition duration-150 truncate max-w-full sm:max-w-xs"
                            >
                                {/* Display the URL without protocol for cleaner look */}
                                {userProfile.websiteURL.replace(/https?:\/\/(www.)?/, '')}
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full sm:w-auto sm:text-right space-y-2 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-200 sm:pl-6">
                
                {/* ID color is now text-accent (darker pink) */}
                <div className="mb-2"> 
                    <span className="text-2xl font-extrabold text-accent">
                        CT-{userProfile.id_public}
                    </span>
                </div>

                <div className="text-sm text-gray-600">
                    <span className="font-semibold">Member Since:</span> {formattedCreationDate}
                </div>
            </div>
        </div>
    );
};


// --- Component: User Authentication (Login/Register) ---
const AuthView = ({ onLoginSuccess, showModalMessage, isRegister, setIsRegister, mainTitle }) => {
  // isRegister state is now managed by the parent App component
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [personalName, setPersonalName] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    
    const payload = isRegister 
        ? { email, password, personalName } 
        : { email, password };

    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
      
      if (isRegister) {
        showModalMessage('Registration Success', 'Your account has been created. Please log in.');
        setIsRegister(false); // Switch to login view after success
      } else {
        onLoginSuccess(response.data.token);
      }
    } catch (error) {
      console.error('Authentication Error:', error.response?.data || error.message);
      showModalMessage(
        isRegister ? 'Registration Failed' : 'Login Failed', 
        error.response?.data?.message || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    // Card for the login/register form
    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl">
      
      {/* Title is now inside the card */}
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          {mainTitle}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Name input - mandatory only for registration */}
        {isRegister && (
            <input
                type="text"
                placeholder="Your Personal Name *" 
                value={personalName}
                onChange={(e) => setPersonalName(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
        )}

        <input
          type="email"
          placeholder="Email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
        <input
          type="password"
          placeholder="Password *"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-black font-bold py-3 rounded-lg shadow-md hover:bg-primary/90 transition duration-150 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : (isRegister ? <><UserPlus size={20} className="mr-2" /> Register</> : <><LogIn size={20} className="mr-2" /> Log In</>)}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button 
          onClick={() => setIsRegister(!isRegister)} // Uses prop setter
          className="text-sm text-gray-500 hover:text-primary transition duration-150"
        >
          {isRegister ? 'Already have an account? Log In' : "Don't have an account? Register Here"}
        </button>
      </div>
    </div>
  );
};


// --- Component: Profile View (Container/View Mode) ---
const ProfileView = ({ userProfile, showModalMessage, fetchUserProfile, authToken }) => {
    // New state to manage the view mode
    const [isEditing, setIsEditing] = useState(false);

    if (!userProfile) return <LoadingSpinner />;

    if (isEditing) {
        return (
            <ProfileEditForm 
                userProfile={userProfile}
                showModalMessage={showModalMessage}
                onSaveSuccess={() => {
                    fetchUserProfile(authToken); // Refresh data
                    setIsEditing(false); // Go back to view mode after save
                }}
                onCancel={() => setIsEditing(false)}
                authToken={authToken}
            />
        );
    }
    
    // View Mode
    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Settings size={24} className="mr-3 text-primary-dark" />
                Profile Settings
            </h2>
            <div className="space-y-4">
                
                {/* UPDATED: Public Visibility Status Box */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-700 mb-2">Public Visibility Status</p>
                    
                    {/* Personal Name Status */}
                    <div className="flex justify-between items-center py-1">
                        <span className="text-base text-gray-800">Personal Name ({userProfile.personalName})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            (userProfile.showPersonalName ?? true) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showPersonalName ?? true) ? 'Visible' : 'Hidden'}
                        </span>
                    </div>

                    {/* Breeder Name Status */}
                    {userProfile.breederName && (
                        <div className="flex justify-between items-center py-1 border-t border-gray-200 mt-2 pt-2">
                            <span className="text-base text-gray-800">Breeder Name ({userProfile.breederName})</span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                userProfile.showBreederName ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {userProfile.showBreederName ? 'Visible' : 'Hidden'}
                            </span>
                        </div>
                    )}

                    {/* NEW: Email Status */}
                    <div className="flex justify-between items-center py-1 border-t border-gray-200 mt-2 pt-2">
                        <span className="text-base text-gray-800">Email Address ({userProfile.email})</span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            // FIX: Using ?? false to ensure reliable display if the field is initially missing
                            (userProfile.showEmailPublic ?? false) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {(userProfile.showEmailPublic ?? false) ? 'Visible' : 'Hidden'}
                        </span>
                    </div>

                    {/* NEW: Website URL Status (only if URL is set) */}
                    {userProfile.websiteURL && (
                        <div className="flex justify-between items-center py-1 border-t border-gray-200 mt-2 pt-2">
                            <span className="text-base text-gray-800">Website URL ({userProfile.websiteURL})</span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                userProfile.showWebsiteURL ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {userProfile.showWebsiteURL ? 'Visible' : 'Hidden'}
                            </span>
                        </div>
                    )}
                    
                </div>
                {/* End Updated Box */}

                {/* Updated ID display (Settings View) */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-700">Personal ID:</p>
                    {/* ID color is now text-accent (darker pink) */}
                    <p className="text-3xl font-extrabold text-accent">CT-{userProfile.id_public}</p> 
                    {/* Removed: This is your unique, public-facing system identifier. */}
                </div>
                
                {/* Removed old email box, as visibility is now shown above */}
            </div>
            <button
                onClick={() => setIsEditing(true)}
                className="mt-6 bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 shadow-md flex items-center"
            >
                <Edit size={20} className="mr-2" /> Edit Profile
            </button>
        </div>
    );
};


// --- Component: Animal List (Stub) ---
const AnimalList = ({ authToken, showModalMessage, onEditAnimal, onSetCurrentView }) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    // Renamed 'filter' to 'statusFilter' for clarity
    const [statusFilter, setStatusFilter] = useState(''); 
    // Existing states for name search and gender filter
    const [nameFilter, setNameFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState(''); // '' means All
    
    // NEW FILTER STATES
    const [statusFilterPregnant, setStatusFilterPregnant] = useState(false);
    const [statusFilterNursing, setStatusFilterNursing] = useState(false);

    const fetchAnimals = useCallback(async () => {
        setLoading(true);
        try {
            // Construct the query string with all filters
            let params = [];
            
            if (statusFilter) {
                params.push(`status=${statusFilter}`);
            }
            if (genderFilter) {
                params.push(`gender=${genderFilter}`);
            }
            if (nameFilter) {
                // Assuming the API supports a 'name' query parameter for search
                params.push(`name=${encodeURIComponent(nameFilter)}`);
            }
            // NEW FILTERS
            if (statusFilterPregnant) {
                params.push(`isPregnant=true`);
            }
            if (statusFilterNursing) {
                params.push(`isNursing=true`);
            }

            const queryString = params.length > 0 ? `?${params.join('&')}` : '';
            
            const url = `${API_BASE_URL}/animals${queryString}`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setAnimals(response.data);
        } catch (error) {
            console.error('Fetch animals error:', error);
            showModalMessage('Error', 'Failed to fetch animal list.');
        } finally {
            setLoading(false);
        }
    }, [authToken, statusFilter, genderFilter, nameFilter, statusFilterPregnant, statusFilterNursing, showModalMessage]); // Added new filters to dependencies

    useEffect(() => {
        fetchAnimals();
    }, [fetchAnimals]);

    const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
    const handleNameFilterChange = (e) => setNameFilter(e.target.value);
    const handleGenderFilterChange = (gender) => setGenderFilter(gender);
    
    // NEW HANDLERS
    const handleFilterPregnant = () => {
        setStatusFilterPregnant(prev => !prev);
        // Ensure only one of Pregnant/Nursing is active for a cleaner search
        if (!statusFilterPregnant) {
            setStatusFilterNursing(false); 
        }
    };

    const handleFilterNursing = () => {
        setStatusFilterNursing(prev => !prev);
        // Ensure only one of Pregnant/Nursing is active for a cleaner search
        if (!statusFilterNursing) {
            setStatusFilterPregnant(false);
        }
    };


    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <ClipboardList size={24} className="mr-3 text-primary-dark" />
                My Animals
            </h2>

            <div className="space-y-4 mb-4">
                
                {/* 1. Gender Filter Buttons (All/Male/Female) */}
                <div className="flex space-x-2">
                    {['All', ...GENDER_OPTIONS].map(gender => {
                        const value = gender === 'All' ? '' : gender;
                        const isCurrentSelected = genderFilter === value;
                        
                        let selectedClasses = '';
                        
                        if (isCurrentSelected) {
                            switch (gender) {
                                case 'Male':
                                    // Requested: Same color as 'Add New Animal' (bg-primary)
                                    selectedClasses = 'bg-primary text-black'; 
                                    break;
                                case 'Female':
                                    // Requested: Same color as 'Logout' (bg-accent)
                                    selectedClasses = 'bg-accent text-white'; 
                                    break;
                                case 'All':
                                default:
                                    // Default/All selection color
                                    selectedClasses = 'bg-primary-dark text-black'; 
                                    break;
                            }
                        } else {
                            // Unselected style
                            selectedClasses = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
                        }

                        return (
                            <button
                                key={gender}
                                onClick={() => handleGenderFilterChange(value)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition duration-150 shadow-sm ${selectedClasses}`}
                            >
                                {gender}
                            </button>
                        );
                    })}
                </div>

                {/* 2. Breeding Status Filters */}
                <div className="flex items-center space-x-2 pt-2 border-t border-gray-100"> 
                    <span className='text-sm font-medium text-gray-700 self-center mr-2'>Breeding Status:</span>
                    
                    {/* Pregnant Filter Button (Dark Pink/Accent) */}
                    <button
                        onClick={handleFilterPregnant}
                        className={`px-3 py-1 text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center space-x-1 ${
                            statusFilterPregnant 
                                ? 'bg-accent text-white hover:bg-accent/80' // Dark Pink/Accent
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        <Egg size={16} /> {/* Icon: Egg */}
                        <span>Pregnant</span>
                    </button>
                    
                    {/* Nursing Filter Button (Primary/Yellow-Tan) */}
                    <button
                        onClick={handleFilterNursing}
                        className={`px-3 py-1 text-sm font-semibold rounded-lg transition duration-150 shadow-sm flex items-center space-x-1 ${
                            statusFilterNursing
                                ? 'bg-primary text-black hover:bg-primary-dark' // Primary color
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        <Milk size={16} /> {/* Icon: Milk */}
                        <span>Nursing</span>
                    </button>
                </div>
                
                {/* 3. Status Filter Dropdown, Name Search, and Add Button */}
                <div className="flex justify-between items-center space-x-4">
                    
                    {/* Status Filter Dropdown */}
                    <select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition w-1/3 min-w-[150px]"
                    >
                        <option value="">All</option> {/* Changed to "All" */}
                        {STATUS_OPTIONS.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>

                    {/* Name Search Input */}
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={nameFilter}
                        onChange={handleNameFilterChange}
                        className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition flex-grow"
                    />


                    <button
                        onClick={() => onSetCurrentView('add-animal')}
                        className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-1 whitespace-nowrap"
                    >
                        <PlusCircle size={18} />
                        <span>Add New Animal</span>
                    </button>
                </div>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div className="space-y-4">
                    {animals.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No animals found matching the filters.</p>
                    ) : (
                        animals.map(animal => (
                            <div key={animal._id} className="p-4 border border-gray-200 rounded-lg shadow-sm flex justify-between items-center hover:bg-gray-50 transition">
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <p className="text-xl font-semibold text-gray-800">
                                            {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {animal.species} | {animal.gender} | {animal.status}
                                        </p>
                                    </div>

                                    {/* Visual Icons */}
                                    {animal.isPregnant && (
                                        <div className="p-1 bg-accent/20 text-accent rounded-full" title="Pregnant">
                                            <Egg size={18} /> {/* Icon: Egg */}
                                        </div>
                                    )}
                                    {animal.isNursing && (
                                        <div className="p-1 bg-blue-100 text-blue-600 rounded-full" title="Nursing">
                                            <Milk size={18} /> {/* Icon: Milk */}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => onEditAnimal(animal)}
                                    className="text-primary hover:text-primary-dark p-2 rounded-full transition"
                                >
                                    <Edit size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// --- Component: Add/Edit Animal (Stub) ---
const AnimalForm = ({ animalToEdit, onSave, onCancel, showModalMessage }) => {
    const [formData, setFormData] = useState({
        species: animalToEdit?.species || SPECIES_OPTIONS[0],
        prefix: animalToEdit?.prefix || '',
        name: animalToEdit?.name || '',
        gender: animalToEdit?.gender || GENDER_OPTIONS[0],
        birthDate: animalToEdit?.birthDate ? new Date(animalToEdit.birthDate).toISOString().substring(0, 10) : '',
        status: animalToEdit?.status || STATUS_OPTIONS[0],
        color: animalToEdit?.color || '',
        coat: animalToEdit?.coat || '',
        remarks: animalToEdit?.remarks || '',
        geneticCode: animalToEdit?.geneticCode || '',
        fatherId_public: animalToEdit?.fatherId_public || null,
        motherId_public: animalToEdit?.motherId_public || null,
        // NEW FIELDS
        isPregnant: animalToEdit?.isPregnant || false,
        isNursing: animalToEdit?.isNursing || false,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            const isChecked = checked;
            setFormData(prev => {
                if (name === 'isPregnant' && isChecked) {
                    // If marking pregnant, uncheck nursing
                    return { ...prev, isPregnant: isChecked, isNursing: false };
                }
                if (name === 'isNursing' && isChecked) {
                    // If marking nursing, uncheck pregnant
                    return { ...prev, isNursing: isChecked, isPregnant: false };
                }
                return { ...prev, [name]: isChecked };
            });
        } else if (name === 'gender') {
            // Reset breeding status if gender changes to Male
            const newFormData = { ...formData, [name]: value };
            if (value === 'Male') {
                newFormData.isPregnant = false;
                newFormData.isNursing = false;
            }
            setFormData(newFormData);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const method = animalToEdit ? 'put' : 'post';
            const url = animalToEdit ? `${API_BASE_URL}/animals/${animalToEdit._id}` : `${API_BASE_URL}/animals`;

            await onSave(method, url, formData);
            showModalMessage('Success', `Animal ${animalToEdit ? 'updated' : 'added'} successfully!`);
            onCancel(); // Return to list view
        } catch (error) {
            console.error('Animal Save Error:', error.response?.data || error.message);
            showModalMessage('Error', error.response?.data?.message || `Failed to ${animalToEdit ? 'update' : 'add'} animal.`);
        } finally {
            setLoading(false);
        }
    };

    const title = animalToEdit ? `Edit: ${animalToEdit.prefix || ''} ${animalToEdit.name}` : 'Add New Animal';

    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{title}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        name="species"
                        value={formData.species}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg"
                        required
                    >
                        {SPECIES_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <input
                        type="text"
                        name="prefix"
                        placeholder="Prefix (Optional)"
                        value={formData.prefix}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg"
                    />
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg"
                        required
                    />
                </div>

                {/* Status & Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg"
                        required
                    >
                        {GENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <input
                        type="date"
                        name="birthDate"
                        placeholder="Birth Date"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg"
                        required
                    />
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg"
                        required
                    >
                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                
                {/* NEW: Breeding Status Checkboxes */}
                {(formData.gender === 'Female' && formData.status === 'Breeding') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <label className="flex items-center space-x-2 text-gray-700">
                            <input
                                type="checkbox"
                                name="isPregnant"
                                checked={formData.isPregnant}
                                onChange={handleChange} 
                                className="rounded text-accent focus:ring-accent" 
                                disabled={loading}
                            />
                            <span className="flex items-center space-x-1">
                                <Egg size={18} className="text-accent" /> {/* Icon: Egg */}
                                <span>Mark as **Pregnant**</span>
                            </span>
                        </label>

                        <label className="flex items-center space-x-2 text-gray-700">
                            <input
                                type="checkbox"
                                name="isNursing"
                                checked={formData.isNursing}
                                onChange={handleChange} 
                                className="rounded text-blue-500 focus:ring-blue-500"
                                disabled={loading}
                            />
                            <span className="flex items-center space-x-1">
                                <Milk size={18} className="text-blue-500" /> {/* Icon: Milk */}
                                <span>Mark as **Nursing**</span>
                            </span>
                        </label>
                    </div>
                )}


                {/* Appearance & Genetics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        name="color"
                        placeholder="Color"
                        value={formData.color}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg"
                    />
                    <input
                        type="text"
                        name="coat"
                        placeholder="Coat Type"
                        value={formData.coat}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg"
                    />
                    <input
                        type="text"
                        name="geneticCode"
                        placeholder="Genetic Code (Optional)"
                        value={formData.geneticCode}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg"
                    />
                </div>

                {/* Pedigree Info (Stubs - Public IDs for linking) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="number"
                        name="fatherId_public"
                        placeholder="Sire Public ID (Optional)"
                        value={formData.fatherId_public || ''}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg"
                    />
                    <input
                        type="number"
                        name="motherId_public"
                        placeholder="Dam Public ID (Optional)"
                        value={formData.motherId_public || ''}
                        onChange={handleChange}
                        className="p-3 border border-gray-300 rounded-lg"
                    />
                </div>

                {/* Remarks */}
                <textarea
                    name="remarks"
                    placeholder="Remarks/Notes (Optional)"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                />

                {/* Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save size={20} className="mr-2" />}
                        {animalToEdit ? 'Save Changes' : 'Add Animal'}
                    </button>
                </div>
            </form>
        </div>
    );
};


// --- Component: Main Application ---
const App = () => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [animalToEdit, setAnimalToEdit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', message: '' });
  
  // LIFTED STATE: Track if the user is on the Register screen or Login screen
  const [isRegister, setIsRegister] = useState(false); 

  // IDLE TIMER REFS
  const timeoutRef = useRef(null);
  const activeEvents = ['mousemove', 'keydown', 'scroll', 'click'];


  // Centralized Modal Handler
  const showModalMessage = useCallback((title, message) => {
    setModalMessage({ title, message });
    setShowModal(true);
  }, []);

  // Logout Handler (must be defined early)
  const handleLogout = useCallback((isIdle = false) => {
    setAuthToken(null);
    setUserProfile(null);
    setCurrentView('list');
    showModalMessage(
        'Logged Out', 
        isIdle ? 'You have been logged out due to 15 minutes of inactivity.' : 'You have been successfully logged out.'
    );
  }, [showModalMessage]);

  // Function to reset the idle timer
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }
    if (authToken) {
        timeoutRef.current = setTimeout(() => {
            handleLogout(true); // Auto-logout due to idle
        }, IDLE_TIMEOUT_MS);
    }
  }, [authToken, handleLogout]);

  // Effect for setting up event listeners for idle tracking
  useEffect(() => {
    if (authToken) {
        // 1. Start timer and set up listeners
        resetTimer(); 
        
        const eventHandler = () => resetTimer();
        
        activeEvents.forEach(event => {
            window.addEventListener(event, eventHandler);
        });
        
        // 2. Cleanup
        return () => {
            clearTimeout(timeoutRef.current);
            activeEvents.forEach(event => {
                window.removeEventListener(event, eventHandler);
            });
        };
    } else {
        // Clear timer if logged out
        clearTimeout(timeoutRef.current);
    }
  }, [authToken, resetTimer]); // Depend on authToken and resetTimer

  // Set the default axios authorization header
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      localStorage.setItem('authToken', authToken);
      fetchUserProfile(authToken);
      // Timer setup is now handled by the separate useEffect above
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('authToken');
      setUserProfile(null);
      setCurrentView('list');
      // Timer cleanup is now handled by the separate useEffect above
    }
  }, [authToken]);


  const fetchUserProfile = useCallback(async (token) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setUserProfile(response.data); 
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        showModalMessage('Authentication Error', 'Could not load user profile. Please log in again.');
        setAuthToken(null);
    }
  }, [showModalMessage]);


  const handleLoginSuccess = (token) => {
    setAuthToken(token);
    setCurrentView('list');
    setIsRegister(false); // Reset to login state just in case
  };


  const handleEditAnimal = (animal) => {
    setAnimalToEdit(animal);
    setCurrentView('edit-animal');
  };

  const handleSaveAnimal = async (method, url, data) => {
    // This function is passed to AnimalForm and handles the actual API call
    if (method === 'post') {
        await axios.post(url, data);
    } else if (method === 'put') {
        await axios.put(url, data);
    }
  };


  const renderView = () => {
    switch (currentView) {
      case 'profile':
        // UPDATED: Pass fetchUserProfile and authToken for the edit form
        return <ProfileView userProfile={userProfile} showModalMessage={showModalMessage} fetchUserProfile={fetchUserProfile} authToken={authToken} />;
      case 'add-animal':
        return (
          <AnimalForm 
            onSave={handleSaveAnimal} 
            onCancel={() => setCurrentView('list')} 
            showModalMessage={showModalMessage} 
          />
        );
      case 'edit-animal':
        return (
          <AnimalForm 
            animalToEdit={animalToEdit}
            onSave={handleSaveAnimal} 
            onCancel={() => setCurrentView('list')} 
            showModalMessage={showModalMessage} 
          />
        );
      case 'litters':
        return (
          <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <BookOpen size={24} className="mr-3 text-primary-dark" />
                Litter Management
            </h2>
            <p className="text-gray-600">Litter management features are currently under development.</p>
          </div>
        );
      case 'list':
      default:
        return (
          <AnimalList
            authToken={authToken}
            showModalMessage={showModalMessage}
            onEditAnimal={handleEditAnimal}
            onSetCurrentView={setCurrentView}
          />
        );
    }
  };
  
  // Conditional rendering for the logged out state
  if (!authToken) {
      const mainTitle = isRegister ? 'Create Account' : 'Welcome Back';
      
      return (
          // Use flex-col to stack logo/title and card, and items-center justify-center to center the block
          <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6 font-sans">
              {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
              
              {/* Logo Block (ABOVE the card) */}
              <div className="flex flex-col items-center mb-4 -mt-16"> 
                  <CustomAppLogo size="w-32 h-32" /> 
              </div>

              {/* Auth Card - Now receives the title */}
              <AuthView 
                  onLoginSuccess={handleLoginSuccess} 
                  showModalMessage={showModalMessage} 
                  isRegister={isRegister} 
                  setIsRegister={setIsRegister} 
                  mainTitle={mainTitle} // Passing the title to the card
              />
          </div>
      );
  }

  // Logged-in Dashboard Layout
  const displayName = userProfile?.showBreederName && userProfile?.breederName 
    ? userProfile.breederName 
    : userProfile?.personalName || 'User';

  return (
    <div className="min-h-screen bg-page-bg p-6 flex flex-col items-center font-sans">
      {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
      
      {/* 1. Header (Dashboard Card) */}
      <header className="w-full max-w-4xl flex justify-between items-center bg-white p-4 rounded-xl shadow-lg mb-6">
        <div className="flex items-center space-x-2">
            <CustomAppLogo size="w-8 h-8" />
            {/* UPDATED: CritterTrack -> Crittertrack */}
            <h1 className="text-2xl font-bold text-gray-800 hidden sm:block">Crittertrack Dashboard</h1>
        </div>

        {/* Navigation and Logout buttons are only shown when logged in */}
        <div className='flex items-center space-x-4'>
            <span className='text-gray-600 text-sm hidden sm:block'>
                Welcome back, <span className='font-semibold text-gray-800'>{displayName}</span>
            </span>
            
            <nav className="flex space-x-2">
                <button
                    onClick={() => setCurrentView('list')}
                    title="Animals"
                    className={`p-2 rounded-lg transition duration-150 ${currentView === 'list' ? 'bg-primary shadow-inner text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    <Cat size={20} />
                </button>
                <button
                    onClick={() => setCurrentView('litters')}
                    title="Litters"
                    className={`p-2 rounded-lg transition duration-150 ${currentView === 'litters' ? 'bg-primary shadow-inner text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    <ClipboardList size={20} />
                </button>
                <button
                    onClick={() => setCurrentView('profile')}
                    title="Profile"
                    className={`p-2 rounded-lg transition duration-150 ${currentView === 'profile' ? 'bg-primary shadow-inner text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    <User size={20} />
                </button>
            </nav>

            <button
                // Call the new dedicated logout handler
                onClick={() => handleLogout(false)} 
                title="Log Out"
                className="bg-accent hover:bg-accent/80 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-1"
            >
                <LogOut size={18} className="hidden sm:inline" />
                <span className="text-sm">Logout</span>
            </button>
        </div>
      </header>

      {/* 2. User Profile Summary Card (Not shown on the Profile page itself) */}
      {currentView !== 'profile' && userProfile && <UserProfileCard userProfile={userProfile} />}

      {/* 3. Main Content Area */}
      <main className="w-full max-w-4xl flex-grow">
        {renderView()}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mt-6 text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
        {/* UPDATED: CritterTrack -> Crittertrack */}
        &copy; {new Date().getFullYear()} Crittertrack Pedigree System.
      </footer>
    </div>
  );
};

export default App;