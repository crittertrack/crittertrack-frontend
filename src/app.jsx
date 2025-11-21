import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, Trash2, Edit, Save, PlusCircle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';

// --- Global Constants ---
// Using a simple path for the API base URL in this self-contained file.
const API_BASE_URL = '/api'; 
const SPECIES_OPTIONS = ['Mouse', 'Rat', 'Hamster'];

// --- Helper Components ---

// Simple message box to replace alerts and confirmation prompts
const ModalMessage = ({ title, message, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <button 
        onClick={onClose} 
        className="w-full bg-primary hover:bg-primary-dark text-black font-semibold py-2 rounded-lg transition duration-150 shadow-md"
      >
        Close
      </button>
    </div>
  </div>
);

// Custom logo component using the public/logo.png
const CustomAppLogo = ({ size = "w-10 h-10" }) => (
    <img 
        src="logo.png" 
        alt="CritterTrack Logo" 
        // No rounded-full class for full logo visibility
        className={`${size} object-cover`} 
        onError={(e) => {
            e.target.onerror = null; 
            e.target.src = "https://placehold.co/40x40/9ED4E0/ffffff?text=Logo";
        }}
    />
);

// --- Auth Component (Login/Register) ---
const LoginScreen = ({ setAuthToken, setUserId, isRegisterView, toggleView, showModalMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [personalName, setPersonalName] = useState(''); // NEW STATE for mandatory name
  const [loading, setLoading] = useState(false);

  // Function to handle the login/register submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isRegisterView && password !== confirmPassword) {
      showModalMessage('Registration Error', 'Passwords do not match.');
      setLoading(false);
      return;
    }
    
    // Additional check for name if registering
    if (isRegisterView && !personalName.trim()) {
        showModalMessage('Registration Error', 'Personal Name is required for registration.');
        setLoading(false);
        return;
    }

    try {
      const endpoint = isRegisterView ? `${API_BASE_URL}/public/register` : `${API_BASE_URL}/public/login`;
      
      const payload = isRegisterView
        ? { email, password, name: personalName } // Include name for registration
        : { email, password };

      const response = await axios.post(endpoint, payload);

      if (response.data.token) {
        setAuthToken(response.data.token);
        setUserId(response.data.userId);
      } else {
        showModalMessage('Authentication Failed', response.data.message || 'An unknown error occurred.');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to communicate with the server. Try again.';
      showModalMessage('Request Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // The main container uses 'items-center' to ensure all children are centered horizontally
    <div className="min-h-screen bg-page-bg flex flex-col p-4 font-sans">
      
      {/* Wrapper for logo and card group, centered vertically and horizontally */}
      <div className="flex-grow flex flex-col justify-center items-center w-full">
      
        {/* 1. Logo and Instruction Text Group: Content centered with items-center */}
        <div className="py-2 flex flex-col items-center"> 
          {/* Logo size remains slightly enlarged */}
          <CustomAppLogo size="w-36 h-36 sm:w-40 h-40" /> 
          {/* Instruction text reverted to a slightly larger size: text-lg sm:text-xl */}
          <p className="text-gray-600 text-lg sm:text-xl mt-4 text-center"> 
            Please sign in or register to continue.
          </p>
        </div>

        {/* 1.5. Toggle View Link (Above Card for Register View) */}
        {/* Card width remains increased: max-w-sm (24rem) on sm screens and max-w-80 (20rem) on mobile */}
        {isRegisterView && (
          <div className="mt-2 w-full max-w-80 sm:max-w-sm">
            <button
              onClick={toggleView}
              className="text-accent hover:text-accent/80 text-sm font-semibold flex items-center justify-center w-full"
            >
              <ChevronLeft size={18} className="mr-1" /> Back to Login
            </button>
          </div>
        )}

        {/* 2. The Main Card Container: Wider (max-w-sm) and Shorter */}
        <div className="
            w-full max-w-80 sm:max-w-sm                             
            bg-white rounded-xl shadow-2xl 
            overflow-hidden flex flex-col mt-2 
        ">
          
          {/* Form Section */}
          <div className="
              w-full p-4 {/* Reduced inner padding to help reduce height */}
              flex flex-col justify-center 
          ">
            
            {/* CARD TITLES (Log In / Register) REMOVED COMPLETELY */}

            {/* Reduced vertical spacing between form fields: space-y-3 */}
            <form className="space-y-3" onSubmit={handleSubmit}>
              
              {/* Personal Name Field - Only for Registration */}
              {isRegisterView && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Personal Name</label>
                  {/* Reduced vertical input padding: py-1.5 */}
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-accent focus:border-accent transition duration-150 ease-in-out text-sm"
                    value={personalName}
                    onChange={(e) => setPersonalName(e.target.value)}
                  />
                </div>
              )}

              {/* Email Address Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                {/* Reduced vertical input padding: py-1.5 */}
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-accent focus:border-accent transition duration-150 ease-in-out text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                {/* Reduced vertical input padding: py-1.5 */}
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isRegisterView ? 'new-password' : 'current-password'}
                  required
                  className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-accent focus:border-accent transition duration-150 ease-in-out text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Confirm Password Field - Only for Registration */}
              {isRegisterView && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  {/* Reduced vertical input padding: py-1.5 */}
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 block w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-accent focus:border-accent transition duration-150 ease-in-out text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              {/* Reduced spacing before button: pt-1 */}
              <div className="pt-1"> 
                <button
                  type="submit"
                  disabled={loading}
                  // Button text size remains smaller
                  className="group relative w-full flex justify-center items-center py-2 px-4 border border-transparent text-base font-bold rounded-lg text-black bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out shadow-md hover:shadow-lg disabled:opacity-60"
                >
                  {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : isRegisterView ? (
                      <UserPlus className="w-5 h-5 mr-2" />
                  ) : (
                      <LogIn className="w-5 h-5 mr-2" />
                  )}
                  {isRegisterView ? 'Register' : 'Log In'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* 3. Toggle View Link (Below Card for Login View) */}
        {/* Text size remains smaller: text-sm */}
        {!isRegisterView && (
          <div className="mt-4 w-full max-w-80 sm:max-w-sm">
            <button
              onClick={toggleView}
              className="text-accent hover:text-accent/80 text-sm font-semibold flex items-center justify-center w-full"
            >
              <UserPlus size={18} className="mr-1" /> Need an Account? Register Here
            </button>
          </div>
        )}

      </div>

      {/* Footer: Content centered with text-center */}
      <footer className="text-xs text-gray-500 text-center pt-4">
          CritterTrack © 2025 | Developed with care
      </footer>
    </div>
  );
};

// --- Animal Management Components (Not displayed when not logged in) ---

// Placeholder components...

// --- Main App Component ---
export default function App() {
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', message: '' });
  
  // State for the main app view (e.g., 'list', 'add', 'edit')
  const [currentView, setCurrentView] = useState('list'); 

  const showModalMessage = (title, message) => {
    setModalMessage({ title, message });
    setShowModal(true);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUserId(null);
    setCurrentView('list'); // Reset view on logout
    showModalMessage('Logged Out', 'You have successfully logged out.');
  };

  const toggleView = () => {
    setIsRegisterView(prev => !prev);
  };

  // --- RENDERING ---
  
  if (!authToken) {
    return (
      <>
        {/* Global Message Modal */}
        {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
        <LoginScreen 
          setAuthToken={setAuthToken}
          setUserId={setUserId}
          isRegisterView={isRegisterView}
          toggleView={toggleView}
          showModalMessage={showModalMessage}
        />
      </>
    );
  }

  // If logged in, show the main dashboard (placeholder for now)
  return (
    // The main container uses 'items-center' to ensure all children are centered horizontally
    <div className="min-h-screen bg-page-bg p-6 flex flex-col items-center font-sans">
      {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
      
      {/* Header is max-w-4xl, centered by parent's items-center */}
      <header className="w-full max-w-4xl flex justify-between items-center bg-white p-4 rounded-xl shadow-lg mb-6">
        <div className="flex items-center space-x-2">
            <CustomAppLogo size="w-8 h-8" />
            <h1 className="text-2xl font-bold text-gray-800">CritterTrack Dashboard</h1>
        </div>
        <button
          onClick={handleLogout}
          className="bg-accent hover:bg-accent/80 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md flex items-center space-x-1"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </header>

      {/* Content Placeholder is max-w-4xl, centered by parent's items-center */}
      <main className="w-full max-w-4xl p-8 bg-white rounded-xl shadow-lg text-center">
        <Cat size={48} className="mx-auto text-primary mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Welcome, User {userId ? userId.substring(0, 8) : '...'}!</h2>
        <p className="text-gray-500 mt-2">
          This is your main application dashboard. Here you will manage your animals, litters, and pedigrees.
        </p>
        <button
            onClick={() => showModalMessage('Feature Coming Soon', 'Animal management features are currently under construction!')}
            className="mt-6 bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-lg transition duration-150 shadow-md"
        >
            Start Managing Critters
        </button>
      </main>
    </div>
  );
}