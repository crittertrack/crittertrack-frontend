import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, Trash2, Edit, Save, PlusCircle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';

// --- Global Constants ---
// FIX: Removed process.env as it is not defined in the client-side environment.
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
				className="w-full bg-accent hover:bg-opacity-80 text-white font-semibold py-2 rounded-lg transition duration-150 shadow-md"
			>
                Close
			</button>
		</div>
	</div>
);

// Simplified CritterTrack Logo Component (Re-used for Login screen)
const Logo = ({ isRegisterView, toggleView }) => (
    <div className="flex flex-col items-center mb-4 sm:mb-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-12 h-12">
            {/* Pink Background Heart/Flower shape using custom colors */}
            <path d="M50 85c-15-20-30-35-30-50 0-11 9-20 20-20s20 9 20 20c0 15-15 30-30 50z" fill="#fbcfe8" />
            <path d="M50 85c15-20 30-35 30-50 0-11-9-20-20-20s-20 9-20 20c0 15 15 30 30 50z" fill="#fbcfe8" />
            
            {/* Green leaves/stem */}
            <path d="M40 90l10-15 10 15z" fill="#10b981" />
            
            {/* Critters - simplified butterflies/moths */}
            <path d="M40 30c-5-5-5-15 0-20 5 5 5 15 0 20z" fill="#ec4899" />
            <path d="M60 30c5-5 5-15 0-20-5 5-5 15 0 20z" fill="#60a5fa" />
            <circle cx="50" cy="28" r="4" fill="#fef08a" />
        </svg>
        <h1 className="text-xl font-bold text-gray-800 mt-1">CritterTrack</h1>
        <p className="text-sm text-gray-500 mt-1">
            {isRegisterView ? "Create your new account." : "Please sign in or register to continue."}
        </p>
        
        {/* Toggle Button for Mobile/Branding Section */}
        <button 
            type="button" 
            onClick={toggleView} 
            className="mt-4 text-accent hover:text-accent/80 text-sm font-medium flex items-center md:hidden"
        >
            {isRegisterView ? 
                <><ChevronLeft size={16} className="mr-1" /> Back to Login</> 
                : 
                <><UserPlus size={16} className="mr-1" /> Need an Account? Register Here</>
            }
        </button>
    </div>
);


// --- Login/Register Component (Using the New Layout) ---
const LoginScreen = ({ setToken, setShowModal, setModalMessage, API_BASE_URL, isRegisterView, toggleView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Client-side validation for registration
        if (isRegisterView && password !== confirmPassword) {
            setShowModal(true);
            setModalMessage({
                title: 'Registration Error',
                message: 'Passwords do not match. Please ensure both fields are identical.'
            });
            setIsLoading(false);
            return;
        }

        const endpoint = isRegisterView ? 'register' : 'login';
        const payload = isRegisterView ? { email, password } : { email, password };
        
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/${endpoint}`, payload);

            if (response.data.token) {
                // Login successful - set the token
                localStorage.setItem('token', response.data.token);
                setToken(response.data.token);
            } else if (isRegisterView) {
                // Registration successful - show message and switch to login view
                setShowModal(true);
                setModalMessage({
                    title: 'Registration Success',
                    message: 'Account created successfully! Please log in now.'
                });
                // Clear fields and switch view
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                toggleView(); 
            }
        } catch (error) {
            console.error('Auth Error:', error.response?.data || error);
            const msg = error.response?.data?.message || 'An unknown error occurred during authentication. Check server status.';
            setShowModal(true);
            setModalMessage({
                title: isRegisterView ? 'Registration Failed' : 'Login Failed',
                message: msg
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-page-bg/50 flex flex-col justify-center items-center p-4 font-sans">
            
            {/* The Main Horizontal Container (md:flex-row) */}
            <div className="
                w-full max-w-sm 
                md:max-w-4xl 
                md:flex md:flex-row md:shadow-2xl md:min-h-[400px]
                bg-white rounded-xl shadow-lg 
                overflow-hidden p-0
            ">
                
                {/* 1. Left Side: Logo and Branding */}
                <div className="
                    flex flex-col items-center justify-center 
                    p-6 sm:p-8 
                    md:w-2/5 md:bg-page-bg md:py-12
                    border-b md:border-b-0 md:border-r border-page-bg
                ">
                    <Logo isRegisterView={isRegisterView} toggleView={toggleView} />
                    <div className="mt-4 text-center hidden md:block">
                         <p className="text-gray-600 text-sm">
                             Manage your pedigrees, litters, and animal records efficiently.
                         </p>
                    </div>
                </div>

                {/* 2. Right Side: Auth Form */}
                <div className="
                    w-full p-6 sm:p-10 
                    md:w-3/5 md:py-12 md:px-16 
                    flex flex-col justify-center
                ">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center md:text-left">
                        {isRegisterView ? 'Create Your Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-sm text-gray-500 mb-6 text-center md:text-left">
                        {isRegisterView ? 'Join the community and start tracking your critters.' : 'Sign in to continue your CritterTrack journey.'}
                    </p>

                    <form className="space-y-4" onSubmit={handleAuth}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-accent focus:border-accent transition duration-150 ease-in-out"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={isRegisterView ? 'new-password' : 'current-password'}
                                required
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-accent focus:border-accent transition duration-150 ease-in-out"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        {isRegisterView && (
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-accent focus:border-accent transition duration-150 ease-in-out"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-accent hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition duration-150 ease-in-out shadow-md hover:shadow-lg disabled:bg-gray-400"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : isRegisterView ? (
                                    <UserPlus className="w-5 h-5 mr-2" />
                                ) : (
                                    <LogIn className="w-5 h-5 mr-2" />
                                )}
                                {isLoading
                                    ? 'Processing...'
                                    : isRegisterView
                                    ? 'Register'
                                    : 'Log In'}
                            </button>
                        </div>
                    </form>
                    
                    {/* Toggle Link (Desktop) */}
                    <div className="mt-6 text-center hidden md:block">
                        <button
                            type="button"
                            onClick={toggleView}
                            className="text-sm font-medium text-accent hover:text-accent/80 flex items-center justify-center transition duration-150"
                        >
                            {isRegisterView ? (
                                <><ChevronLeft className="w-4 h-4 mr-1"/> Back to Login</>
                            ) : (
                                <><UserPlus className="w-4 h-4 mr-1"/> Need an Account? Register Here</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer fixed at the bottom */}
            <footer className="absolute bottom-4 text-xs text-gray-500 text-center">
                CritterTrack © 2025 | Powered by Vercel
            </footer>
        </div>
    );
};


// --- Animal Record Management Components (Truncated for brevity) ---
// ... (Your existing AnimalRecordForm and AnimalList functions would go here)
// ...

// Main App Component
const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isRegisterView, setIsRegisterView] = useState(false); // New state to toggle between Login/Register
    const [view, setView] = useState('dashboard'); // Tracks the main application view: 'dashboard', 'animals', 'litters', 'pedigree', 'profile'
    
    // Global Modal State
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState({ title: '', message: '' });

    // State for data fetching (e.g., list of animals, profile data)
    const [profile, setProfile] = useState(null); 
    const [animals, setAnimals] = useState([]);
    const [litters, setLitters] = useState([]);


    const toggleView = () => setIsRegisterView(prev => !prev);
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setProfile(null);
        setAnimals([]);
        setLitters([]);
        setIsRegisterView(false);
        // Ensure the app defaults to login screen after logout
        setView('dashboard'); 
    };

    // --- EFFECT: Load initial data (User Profile, Animals) after token changes ---
    useEffect(() => {
        if (token) {
            // Placeholder: Fetch Profile and Animals on login
            console.log("Token detected. Fetching user profile and data...");
            // fetchProfile();
            // fetchAnimals();
            setView('dashboard'); // Default to dashboard on successful login
        } else {
            // Set view back to login state
            setView('login');
        }
    }, [token]);

    // --- Render Logic ---

    // 1. Loading/Auth State
    if (token === null || token === undefined) {
        // User is not authenticated, show the Login/Register Screen
        return (
            <div className="min-h-screen">
                <LoginScreen 
                    setToken={setToken} 
                    setShowModal={setShowModal} 
                    setModalMessage={setModalMessage} 
                    API_BASE_URL={API_BASE_URL}
                    isRegisterView={isRegisterView}
                    toggleView={toggleView}
                />
                 {/* Global Message Modal */}
                {showModal && (
                    <ModalMessage 
                        title={modalMessage.title} 
                        message={modalMessage.message} 
                        onClose={() => setShowModal(false)}
                    />
                )}
            </div>
        );
    }

    // 2. Authenticated State (Dashboard/Main App)
    
    // --- Dashboard Placeholder ---
    const Dashboard = () => (
        <div className="p-8 text-center bg-white rounded-xl shadow-lg w-full max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome back, {profile?.personalName || 'User'}!</h2>
            <p className="text-gray-600 mb-8">This is your main dashboard.</p>
            
            <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center mx-auto transition duration-150"
            >
                <LogOut size={20} className="mr-2" />
                Log Out
            </button>
        </div>
    );
    // --- End Dashboard Placeholder ---

    // Main App Content Switcher
    let content;
    switch (view) {
        // case 'animals': content = <AnimalList ... />; break;
        // case 'litters': content = <LitterList ... />; break;
        // case 'pedigree': content = <PedigreeView ... />; break;
        // case 'profile': content = <ProfileSettings ... />; break;
        case 'dashboard':
        default:
            content = <Dashboard />;
            break;
    }

    // The main authenticated layout (Header + Content)
    return (
        <div className="min-h-screen bg-page-bg p-4 flex flex-col items-center font-sans">
            {/* Main Header/Navigation */}
            <header className="w-full max-w-6xl bg-white rounded-xl shadow-md p-4 mb-6 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <Cat size={32} className="text-accent" />
                    <h1 className="text-2xl font-bold text-gray-800">CritterTrack</h1>
                </div>
                <nav className="flex space-x-4 text-sm font-medium">
                    <button onClick={() => setView('dashboard')} className="text-gray-600 hover:text-accent transition duration-150">Dashboard</button>
                    {/* Add more navigation buttons here */}
                    <button onClick={logout} className="text-red-500 hover:text-red-700 transition duration-150 flex items-center">
                        <LogOut size={16} className="mr-1" /> Logout
                    </button>
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="w-full max-w-6xl flex-grow">
                {content}
            </main>

             {/* Global Message Modal */}
            {showModal && (
                <ModalMessage 
                    title={modalMessage.title} 
                    message={modalMessage.message} 
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default App;