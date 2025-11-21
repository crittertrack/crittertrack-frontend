import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft } from 'lucide-react';

// --- Global Constants ---
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// --- Define Custom Colors as Exact Hex Codes ---
const BG_PINK_HEX = '#FFDEE9'; // Pink background
const ACCENT_BLUE_HEX = '#A4E2F1'; // Light Blue for buttons/primary color
const HOT_PINK_HEX = '#D37197'; // Hot Pink for the registration link

// --- Helper Components ---

// Simple message box to replace alerts and confirmation prompts
const ModalMessage = ({ title, message, onClose }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <button 
        onClick={onClose} 
        // Using a standard Tailwind blue for contrast on the modal itself
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition duration-150 shadow-md"
      >
        Close
      </button>
    </div>
  </div>
);

// --- 1. Authentication/Registration Components ---

const AuthForm = ({ isRegister, setToken, setIsRegisterView, setShowModal, setModalMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [personalName, setPersonalName] = useState('');
  const [breederName, setBreederName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isRegister ? `${API_BASE_URL}/users/register` : `${API_BASE_URL}/users/login`;
    const data = isRegister 
      ? { email, password, personalName, breederName, showBreederName: !!breederName }
      : { email, password };

    try {
      const response = await axios.post(endpoint, data);
      
      if (isRegister) {
        // Registration successful logic
        setModalMessage({ 
          title: 'Registration Successful!', 
          message: 'Your account has been created. Please log in now to access your dashboard.' 
        });
        setShowModal(true);
        // Clear form and switch back to Login view
        setEmail('');
        setPassword('');
        setPersonalName('');
        setBreederName('');
        setIsRegisterView(false); // Switch to login view after registration
        
      } else {
        // Login successful logic
        const token = response.data?.token; // Added optional chaining for safer access
        if (token) {
            localStorage.setItem('userToken', token);
            setToken(token); // This is the line that triggers the dashboard view!
            // Clear credentials after success
            setEmail('');
            setPassword('');
        } else {
             // Handle unexpected successful response without token
             throw new Error("Login succeeded but no token was returned by the server. Check backend response format.");
        }
      }
    } catch (err) {
      console.error('Auth Error:', err.response?.data || err);
      // Fallback message for network or unexpected error
      const message = err.response?.data?.message || 'A network error occurred or the backend is unreachable.';
      
      setModalMessage({ 
        title: isRegister ? 'Registration Failed' : 'Login Failed', 
        message: message 
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-indigo-100">
      <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
        {isRegister ? 'Register Account' : 'Sign In'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        />

        {isRegister && (
          <>
            <input 
              type="text" 
              placeholder="Your Personal Name" 
              value={personalName} 
              onChange={(e) => setPersonalName(e.target.value)} 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input 
              type="text" 
              placeholder="Breeder Name (Optional)" 
              value={breederName} 
              onChange={(e) => setBreederName(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </>
        )}

        <button 
          type="submit" 
          disabled={loading}
          // Button uses the light blue accent color and dark text for contrast
          className={`w-full text-gray-800 font-bold py-2.5 rounded-lg transition duration-150 shadow-md disabled:opacity-50 flex items-center justify-center hover:shadow-lg`}
          style={{ backgroundColor: ACCENT_BLUE_HEX }}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 mr-3 text-gray-800" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              {isRegister ? <UserPlus size={18} className="mr-2" /> : <LogIn size={18} className="mr-2" />}
              {isRegister ? 'Create Account' : 'Sign In'}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

// --- 2. Dashboard Component (Placeholder) ---

const Dashboard = ({ onLogout }) => {
  // This will eventually fetch and display user's animals and litters
  const [view, setView] = useState('list'); // 'list' or 'add'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('userToken');

  useEffect(() => {
    // This is the protected fetch that requires the token.
    const fetchUserData = async () => {
      if (!token) {
        setError("Missing authentication token.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // We are using /api/animals now, which is a protected route.
        const response = await axios.get(`${API_BASE_URL}/animals`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(response.data); // This data will be the list of animals
        setError(null);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err.response?.data || err);
        if (err.response?.status === 401) {
            setError("Session expired or token invalid. Please log in again.");
            onLogout();
        } else {
            // Note: If the database is empty, /api/animals might return an empty array, which is fine.
            // This error is for unexpected status codes or network issues.
            setError(err.response?.data?.message || 'Failed to load dashboard data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, onLogout]); // Re-fetch if token changes

  if (loading) return <div className="text-center p-8"><p className="text-xl text-indigo-500">Loading Dashboard...</p></div>;
  
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg shadow-md max-w-lg mx-auto">
      <p className="font-bold">Error Loading Data:</p>
      <p>{error}</p>
      <button 
        onClick={onLogout}
        className="mt-4 flex items-center text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition duration-150 shadow-md"
      >
        <LogOut size={16} className="mr-2" /> Force Log Out
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-6xl p-6 bg-white rounded-xl shadow-2xl border border-indigo-100">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <Cat size={24} className="mr-3 text-indigo-600" />
            My Critter Registry
        </h2>
        <button 
          onClick={onLogout}
          className="flex items-center text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition duration-150 shadow-md"
        >
          <LogOut size={16} className="mr-2" /> Log Out
        </button>
      </div>

      <p className="text-gray-500 mb-6">
        Welcome! You are successfully connected to the backend API.
      </p>

      {/* Placeholder for Animal List */}
      <div className="mt-4">
        <h3 className="text-2xl font-semibold text-indigo-600 mb-4">
            {data?.length} Animals Registered (Placeholder Data)
        </h3>
        <ul className="space-y-3">
          {data && data.length > 0 ? (
            data.map((animal) => (
              <li key={animal._id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="font-medium text-gray-700">{animal.name}</span> 
                <span className="text-sm text-gray-500 ml-3">({animal.gender}, ID: {animal.id_public})</span>
              </li>
            ))
          ) : (
            <p className="text-gray-500 italic">You haven't added any animals yet. Time to register your first critter!</p>
          )}
        </ul>
      </div>

    </div>
  );
};

// --- 3. Main App Component (Routing and State) ---

const App = () => {
  const [userToken, setUserToken] = useState(localStorage.getItem('userToken'));
  // Use state to track the current view between login/register
  const [isRegisterView, setIsRegisterView] = useState(false); 
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', message: '' });

  // Handle token setting (used by AuthForm on successful login)
  const handleSetToken = (token) => {
    setUserToken(token);
    // When the token is set, it automatically triggers the Dashboard view
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setUserToken(null);
    setIsRegisterView(false); // Default to login view after logout
  };

  const renderAuthContent = () => (
    <div className="flex flex-col items-center">
      {isRegisterView ? (
        <AuthForm 
          isRegister={true} 
          setToken={handleSetToken} 
          setIsRegisterView={setIsRegisterView} // Pass setter to switch to login on success
          setShowModal={setShowModal}
          setModalMessage={setModalMessage}
        />
      ) : (
        <AuthForm 
          isRegister={false} 
          setToken={handleSetToken} 
          setIsRegisterView={setIsRegisterView}
          setShowModal={setShowModal}
          setModalMessage={setModalMessage}
        />
      )}
      
      <button 
        onClick={() => setIsRegisterView(!isRegisterView)}
        // Hot Pink Text Color for contrast
        className="mt-4 text-sm font-medium flex items-center hover:text-pink-700 transition duration-150"
        style={{ color: HOT_PINK_HEX }}
      >
        {isRegisterView ? 
          <><ChevronLeft size={16} className="mr-1" /> Back to Login</> 
          : 
          <><UserPlus size={16} className="mr-1" /> Need an Account? Register Here</>
        }
      </button>
    </div>
  );


  return (
    // Exact Pink Background
    <div className="min-h-screen p-6 flex flex-col items-center" style={{ backgroundColor: BG_PINK_HEX }}>
      <header className="py-10 w-full max-w-6xl text-center">
        {/* Logo Image Path Check: This path requires the file to be in the project's public/ folder */}
        <img 
            src="/crittertrack-logo-new.png" 
            alt="CritterTrack Pedigree App Logo" 
            className="mx-auto h-24 sm:h-32 mb-2" 
        />
        <p className="text-lg text-gray-500 mt-2">
          {userToken ? 'Welcome back!' : 'Please sign in or register to continue.'}
        </p>
      </header>

      <main className="flex-grow p-4 w-full flex justify-center">
        {userToken ? (
          <Dashboard onLogout={handleLogout} />
        ) : (
          renderAuthContent()
        )}
      </main>
      
      <footer className="py-4 text-sm text-gray-400 w-full text-center">
        &copy; 2024 CritterTrack Development
      </footer>

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