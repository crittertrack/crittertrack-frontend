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
        className="w-full bg-primary hover:-bg-primary-dark text-black font-semibold py-2 rounded-lg transition duration-150 shadow-md"
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

    try {
      const endpoint = isRegisterView ? `${API_BASE_URL}/public/register` : `${API_BASE_URL}/public/login`;
      const response = await axios.post(endpoint, { email, password });

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
    // Set up main flex column
    <div className="min-h-screen bg-page-bg flex flex-col p-4 font-sans">
      
      {/* Wrapper for logo and card group, centered vertically */}
      <div className="flex-grow flex flex-col justify-center items-center w-full">
      
        {/* 1. Logo (Now even bigger) */}
        <div className="p-5 mb-2 flex flex-col items-center"> 
          <CustomAppLogo size="w-32 h-32 sm:w-40 sm:h-40" />
          {/* Grey instruction text under the logo */}
          <p className="text-gray-600 text-sm mt-4 text-center">
            Please sign in or register to continue.
          </p>
        </div>

        {/* 2. The Main Card Container (Now max-w-xs) */}
        <div className="
            w-full max-w-xs                              
            bg-white rounded-xl shadow-2xl 
            overflow-hidden flex flex-col mt-6
        ">
          
          {/* Form Section */}
          <div className="
              w-full p-6 sm:p-8 flex flex-col justify-center
          ">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center"> 
              {isRegisterView ? 'Register' : 'Log In'}
            </h2>

            <form className="space-y-5" onSubmit={handleSubmit}> 
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-accent focus:border-accent transition duration-150 ease-in-out"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isRegisterView ? 'new-password' : 'current-password'}
                  required
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-accent focus:border-accent transition duration-150 ease-in-out"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {isRegisterView && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-accent focus:border-accent transition duration-150 ease-in-out"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              )}

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  // Button uses the same light blue/green color as the logo box: bg-primary
                  className="group relative w-full flex justify-center items-center py-2.5 px-4 border border-transparent text-lg font-bold rounded-lg text-black bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-150 ease-in-out shadow-md hover:shadow-lg disabled:opacity-60"
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
        
        {/* 3. Toggle View Link (MOVED OUTSIDE CARD) */}
        <div className="mt-6 text-center w-full max-w-xs">
          <button
            onClick={toggleView}
            className="text-accent hover:text-accent/80 text-md font-semibold flex items-center justify-center w-full"
          >
            {isRegisterView ? 
              <><ChevronLeft size={18} className="mr-1" /> Back to Login</> 
              : 
              <><UserPlus size={18} className="mr-1" /> Need an Account? Register Here</>
            }
          </button>
        </div>

      </div>

      {/* Footer is now a static element at the bottom of the flex column, with padding */}
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
    <div className="min-h-screen bg-page-bg p-6 flex flex-col items-center font-sans">
      {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
      
      {/* Header */}
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

      {/* Content Placeholder */}
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