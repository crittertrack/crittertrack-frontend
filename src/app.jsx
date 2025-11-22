import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, Trash2, Edit, Save, PlusCircle, ArrowLeft, Loader2, RefreshCw, User, ClipboardList, BookOpen, Settings } from 'lucide-react';

// --- Global Constants ---
const API_BASE_URL = 'https://crittertrack-pedigree-production.up.railway.app/api';

const SPECIES_OPTIONS = ['Mouse', 'Rat', 'Hamster'];
const GENDER_OPTIONS = ['Male', 'Female'];
const STATUS_OPTIONS = ['Pet', 'Breeding', 'Available', 'Retired'];

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
    alt="CritterTrack Logo" 
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
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden shadow-inner cursor-pointer" onClick={() => !disabled && document.getElementById('profileImageInput').click()}>
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
    
    // NEW STATES FOR TOGGLES
    // Default to true for personal name, as it was previously always shown.
    const [showPersonalName, setShowPersonalName] = useState(userProfile.showPersonalName ?? true); 
    const [showBreederName, setShowBreederName] = useState(userProfile.showBreederName ?? false); 
    
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
        
        // Note: Actual image upload logic is complex and skipped here, treating it as a UI placeholder for now. 
        // We will only send the text fields and the new visibility flags.

        const payload = {
            personalName: personalName,
            breederName: breederName || null,
            // NEW FIELDS
            showPersonalName: showPersonalName,
            showBreederName: showBreederName,
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

                        {/* NEW TOGGLES */}
                        <div className="pt-2 space-y-2">
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
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 overflow-hidden shadow-inner">
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
            </div>

            <div className="w-full sm:w-auto sm:text-right space-y-2 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-200 sm:pl-6">
                
                {/* UPDATED: ID color changed to text-accent (darker pink) */}
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
                
                {/* UPDATED: Public Visibility Status Box (Replaces old "Display Name" box) */}
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
                    
                </div>
                {/* End Updated Box */}

                {/* Updated ID display (Settings View) */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-700">Personal ID:</p>
                    {/* UPDATED: ID color changed to text-accent (darker pink) */}
                    <p className="text-3xl font-extrabold text-accent">CT-{userProfile.id_public}</p> 
                    <p className="text-sm text-gray-500 mt-2">This is your unique, public-facing system identifier.</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-700">Email:</p>
                    <p className="text-xl text-gray-800">{userProfile.email}</p>
                </div>
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
    const [filter, setFilter] = useState('');

    const fetchAnimals = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/animals?status=${filter}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setAnimals(response.data);
        } catch (error) {
            console.error('Fetch animals error:', error);
            showModalMessage('Error', 'Failed to fetch animal list.');
        } finally {
            setLoading(false);
        }
    }, [authToken, filter, showModalMessage]);

    useEffect(() => {
        fetchAnimals();
    }, [fetchAnimals]);

    const handleFilterChange = (e) => setFilter(e.target.value);

    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <ClipboardList size={24} className="mr-3 text-primary-dark" />
                My Animal Registry
            </h2>

            <div className="flex justify-between items-center mb-4 space-x-4">
                <select
                    value={filter}
                    onChange={handleFilterChange}
                    className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary transition"
                >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
                <button
                    onClick={() => onSetCurrentView('add-animal')}
                    className="bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-1"
                >
                    <PlusCircle size={18} />
                    <span>Add New Animal</span>
                </button>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div className="space-y-4">
                    {animals.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No animals found. Try adding one!</p>
                    ) : (
                        animals.map(animal => (
                            <div key={animal._id} className="p-4 border border-gray-200 rounded-lg shadow-sm flex justify-between items-center hover:bg-gray-50 transition">
                                <div>
                                    <p className="text-xl font-semibold text-gray-800">
                                        {animal.prefix ? `${animal.prefix} ` : ''}{animal.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {animal.species} | {animal.gender} | {animal.status}
                                    </p>
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
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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


  // Centralized Modal Handler
  const showModalMessage = useCallback((title, message) => {
    setModalMessage({ title, message });
    setShowModal(true);
  }, []);

  // Set the default axios authorization header
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      localStorage.setItem('authToken', authToken);
      fetchUserProfile(authToken);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('authToken');
      setUserProfile(null);
      setCurrentView('list');
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

  const handleLogout = () => {
    setAuthToken(null);
    setUserProfile(null);
    setCurrentView('list');
    showModalMessage('Logged Out', 'You have been successfully logged out.');
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
            <h1 className="text-2xl font-bold text-gray-800 hidden sm:block">CritterTrack Dashboard</h1>
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
                onClick={handleLogout}
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
        &copy; {new Date().getFullYear()} CritterTrack Pedigree System.
      </footer>
    </div>
  );
};

export default App;