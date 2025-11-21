import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, Trash2, Edit, Save, PlusCircle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';

// --- Global Constants ---
// Use environment variable for the API base URL in production, fall back to proxy in development.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
const SPECIES_OPTIONS = ['Mouse', 'Rat', 'Hamster']; // NEW: Default species list

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

// Form Input Component for consistency
const InputField = ({ id, label, type = 'text', value, onChange, required = false, disabled = false }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-accent focus:border-accent disabled:bg-gray-100 transition duration-150"
    />
  </div>
);

// Critter Interface for Type Safety (or documentation)
/**
 * @typedef {object} Critter
 * @property {number} id
 * @property {string} name
 * @property {string} species
 * @property {number} age
 * @property {string} gender
 * @property {string} owner
 */

// --- 1. Authentication/Registration Components ---

const AuthForm = ({ isRegister, setToken, setIsRegisterView, setShowModal, setModalMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [breederName, setBreederName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const endpoint = isRegister ? `${API_BASE_URL}/users/register` : `${API_BASE_URL}/users/login`;
    // FIX: Changed 'name' key to 'personalName' to match backend requirement
    const payload = isRegister 
      ? { email, password, personalName: name, breederName: breederName || null } 
      : { email, password };

    try {
      const response = await axios.post(endpoint, payload);

      if (response.data.token) {
        // Store token in session storage for persistence and state update
        sessionStorage.setItem('critterTrackToken', response.data.token);
        setToken(response.data.token);
      } else {
        // Handle successful registration without a token (common pattern)
        if (isRegister) {
            setShowModal(true);
            setModalMessage({
                title: 'Registration Success',
                message: 'Your account has been created successfully. Please log in now.'
            });
            setIsRegisterView(false); // Switch to login view
        } else {
            throw new Error('Login failed: Token not received.');
        }
      }
    } catch (error) {
      console.error('Auth Error:', error.response?.data || error.message);
      setShowModal(true);
      setModalMessage({
        title: isRegister ? 'Registration Failed' : 'Login Failed',
        message: error.response?.data?.message || 'An unexpected error occurred. Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const title = isRegister ? 'Create Account' : 'Welcome Back';

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">{title}</h2>
      
      {isRegister && (
        <>
          <InputField 
            id="name" 
            label="Personal Name" // LABEL CHANGED
            value={name} 
            onChange={setName} 
            required 
            disabled={isLoading}
          />
          
          {/* NEW OPTIONAL BREEDER NAME FIELD */}
          <InputField 
            id="breederName" 
            label="Breeder Name (Optional)" 
            value={breederName} 
            onChange={setBreederName} 
            required={false}
            disabled={isLoading}
          />
        </>
      )}
      
      <InputField
        id="email" 
        label="Email Address" 
        type="email"
        value={email} 
        onChange={setEmail} 
        required 
        disabled={isLoading}
      />
      
      <InputField 
        id="password" 
        label="Password" 
        type="password"
        value={password} 
        onChange={setPassword} 
        required 
        disabled={isLoading}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center bg-primary hover:bg-primary-dark text-black font-bold py-3 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg disabled:bg-primary/70"
      >
        {isLoading && <Loader2 size={20} className="animate-spin mr-2" />}
        {isRegister ? 'Register' : 'Log In'}
      </button>
    </form>
  );
};


// --- 2. Dashboard Components ---

const CritterForm = ({ onCritterSaved, initialCritter, token, onCancel }) => {
  const [critter, setCritter] = useState(initialCritter || { 
    name: '', 
    species: '', 
    age: '', 
    gender: 'Male', // Default to Male
    owner: '' // This should eventually be pre-filled from user data
  });
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialCritter;

  const handleChange = (field, value) => {
    setCritter(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    const payload = { 
        ...critter, 
        age: parseInt(critter.age, 10) 
    };

    try {
      if (isEditing) {
        // Update Critter
        await axios.put(`${API_BASE_URL}/critters/${critter.id}`, payload, config);
      } else {
        // Add new Critter
        await axios.post(`${API_BASE_URL}/critters`, payload, config);
      }
      onCritterSaved();
      onCancel(); // Close form
    } catch (error) {
      console.error('Critter Save Error:', error.response?.data || error.message);
      // In a real app, you would show a modal here
    } finally {
      setIsLoading(false);
    }
  };

const isSpeciesDisabled = isLoading || (!!critter.species && !isEditing);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full max-w-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? 'Edit Critter' : 'Add New Critter'}</h3>
      <form onSubmit={handleSubmit}>
        <InputField id="critterName" label="Name" value={critter.name} onChange={(val) => handleChange('name', val)} required disabled={isLoading} />
        <InputField id="critterSpecies" label="Species" value={critter.species} onChange={(val) => handleChange('species', val)} required disabled={isSpeciesDisabled} />
        <InputField id="critterAge" label="Age (Years)" type="number" value={critter.age} onChange={(val) => handleChange('age', val)} required disabled={isLoading} />
        <InputField id="critterOwner" label="Owner Name" value={critter.owner} onChange={(val) => handleChange('owner', val)} required disabled={isLoading} />
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            value={critter.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-accent focus:border-accent transition duration-150"
            disabled={isLoading}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-xl transition duration-150 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center bg-primary hover:bg-primary-dark text-black font-semibold py-2 px-4 rounded-xl transition duration-150 shadow-md hover:shadow-lg disabled:bg-primary/70"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin mr-2" /> : <Save size={20} className="mr-1" />}
            {isEditing ? 'Save Changes' : 'Add Critter'}
          </button>
        </div>
      </form>
    </div>
  );
};


const CritterCard = ({ critter, token, onCritterDeleted, onCritterUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    // In a real app, use a modal for confirmation instead of window.confirm
    if (window.confirm(`Are you sure you want to delete ${critter.name}?`)) {
        setIsLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/critters/${critter.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onCritterDeleted(critter.id);
        } catch (error) {
            console.error('Critter Delete Error:', error.response?.data || error.message);
            // Handle error display
        } finally {
            setIsLoading(false);
        }
    }
  };
  
  // Quick fix: Since we aren't displaying critter-specific editing, let's just 
  // route to the main form when Edit is clicked.
  const handleEditClick = () => {
      onCritterUpdated(critter); 
  };
  
  // This component will only show the display card, editing is done via the main form

  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between transition-all hover:shadow-xl transform hover:-translate-y-0.5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Cat size={32} className="text-accent" />
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${critter.gender === 'Male' ? 'bg-blue-100 text-blue-800' : critter.gender === 'Female' ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800'}`}>
            {critter.gender}
          </span>
        </div>
        <h4 className="text-xl font-bold text-gray-800 mb-1 truncate">{critter.name}</h4>
        <p className="text-sm text-gray-600 mb-1">Species: {critter.species}</p>
        
        <div className="space-y-1 text-sm text-gray-700">
          <p><strong>Age:</strong> {critter.age} years</p>
          <p><strong>Owner:</strong> {critter.owner}</p>
          <p><strong>ID:</strong> {critter.id}</p>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        <button 
          onClick={handleEditClick}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-3 rounded-lg text-sm transition duration-150 disabled:opacity-50"
        >
          <Edit size={16} className="mr-1" /> Edit
        </button>
        <button 
          onClick={handleDelete}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg text-sm transition duration-150 disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} className="mr-1" />} Delete
        </button>
      </div>
    </div>
  );
};

const SpeciesSelector = ({ onSelectSpecies, onCancel }) => {
  const [customSpecies, setCustomSpecies] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSelect = (species) => {
    onSelectSpecies(species);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customSpecies.trim()) {
      onSelectSpecies(customSpecies.trim());
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Select Species</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {SPECIES_OPTIONS.map(species => (
          <button
            key={species}
            onClick={() => handleSelect(species)}
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg text-lg font-semibold text-gray-700 hover:bg-gray-100 transition duration-150"
          >
            {species}
          </button>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-6">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition duration-150 flex items-center justify-center"
          >
            <PlusCircle size={20} className="mr-2" />
            Enter Custom Species
          </button>
        ) : (
          <form onSubmit={handleCustomSubmit} className="flex space-x-3 items-end">
            <div className="flex-grow">
                <InputField
                  id="customSpecies"
                  label="Custom Species Name"
                  value={customSpecies}
                  onChange={setCustomSpecies}
                  required
                />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-black font-semibold py-3 px-6 rounded-xl transition duration-150 whitespace-nowrap"
            >
              Set Species
            </button>
          </form>
        )}
      </div>

      <button 
        onClick={onCancel}
        className="mt-6 flex items-center text-red-500 hover:text-red-700 text-sm font-medium transition duration-150 mx-auto"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
      </button>
    </div>
  );
};

const Dashboard = ({ onLogout }) => {
  /** @type {[Critter[], React.Dispatch<React.SetStateAction<Critter[]>>]} */
  const [critters, setCritters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  /** @type {[Critter | null, React.Dispatch<React.SetStateAction<Critter | null>>]} */
  const [editingCritter, setEditingCritter] = useState(null);
  
  const token = sessionStorage.getItem('critterTrackToken');

  const fetchCritters = async () => {
    if (!token) {
        setError("Authentication token missing.");
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/critters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCritters(response.data);
    } catch (err) {
      console.error('Fetch Error:', err.response?.data || err.message);
      setError('Failed to load critter data. Check backend connection and CORS configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCritters();
  }, []); // Run only on initial mount

  // Handler for opening the edit form
  const handleEditCritter = (critter) => {
    setEditingCritter(critter);
	setSelectedSpecies(null);
    setIsFormVisible(true);
  };
  
  // Handler for successful save/update/delete
  const handleDataChange = () => {
    // Re-fetch all data to ensure the list is up-to-date
    fetchCritters(); 
  };
  
  // Handler for cancelling form or closing modal
  const handleCancelForm = () => {
      setIsFormVisible(false);
      setEditingCritter(null);
	  setSelectedSpecies(null);
  };
  
  // NEW: Handler for when a species is chosen in the selector
  const handleSpeciesSelected = (species) => {
      setSelectedSpecies(species);
      setIsFormVisible(true); // Keep form panel visible
  };
  
  // NEW: Handler for starting the new two-step flow
  const startAddCritterFlow = () => {
      setEditingCritter(null);
      setSelectedSpecies(null);
      setIsFormVisible(true);
  };
  
  // Handler for successful deletion from the CritterCard
  const handleCritterDeleted = (id) => {
      setCritters(prevCritters => prevCritters.filter(c => c.id !== id));
  };

  // CONDITIONAL RENDERING LOGIC UPDATED
  if (isFormVisible) {
      // Check 1: If we are not editing an existing critter AND a species hasn't been selected, show selector
      if (!editingCritter && !selectedSpecies) {
          return (
              <SpeciesSelector 
                  onSelectSpecies={handleSpeciesSelected} 
                  onCancel={handleCancelForm} 
              />
          );
      }
      
      // Check 2: If we are editing OR a species HAS been selected, show the CritterForm
      return (
          <div className="flex flex-col items-center w-full max-w-6xl">
              <button 
                  onClick={handleCancelForm}
                  className="mb-6 flex items-center text-accent hover:text-accent/80 text-base font-medium transition duration-150"
              >
                  <ArrowLeft size={20} className="mr-1" /> Back to Dashboard
              </button>
              <CritterForm 
                  token={token}
                  initialCritter={editingCritter || { species: selectedSpecies }} // Pass selectedSpecies to form
                  onCritterSaved={handleDataChange}
                  onCancel={handleCancelForm}
              />
          </div>
      );
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <Cat size={32} className="mr-3 text-accent" />
          My Critters ({critters.length})
        </h2>
        <div className='flex space-x-3'>
            <button
              onClick={fetchCritters}
              disabled={isLoading}
              className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-xl transition duration-150 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={isLoading ? "animate-spin mr-2" : "mr-2"} />
              Refresh
            </button>
            <button
              onClick={() => { setEditingCritter(null); setIsFormVisible(true); }}
              className="flex items-center bg-primary hover:bg-primary-dark text-black font-bold py-2 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
            >
              <PlusCircle size={20} className="mr-2" />
              Add New Critter
            </button>
        </div>
      </div>

      {isLoading && (
        <div className="p-8 text-center text-gray-600">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" />
          Loading Critter Data...
        </div>
      )}
      
      {error && !isLoading && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl mb-6" role="alert">
            <p className="font-bold">Data Error</p>
            <p>{error}</p>
            <p className='mt-2 text-sm'>Please check your Vercel Environment Variables to ensure the backend URL is correct.</p>
        </div>
      )}

      {!isLoading && !error && critters.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
          <Cat size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No critters found.</p>
          <p className="text-gray-500 mt-2">Start by adding your first companion above!</p>
        </div>
      )}

      {!isLoading && critters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {critters.map(critter => (
            <CritterCard 
                key={critter.id} 
                critter={critter} 
                token={token} 
                onCritterDeleted={handleCritterDeleted}
                onCritterUpdated={handleEditCritter} // Pass handler for editing
            />
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={onLogout}
          className="flex items-center mx-auto text-red-500 hover:text-red-700 font-medium py-2 px-4 rounded-lg transition duration-150"
        >
          <LogOut size={20} className="mr-2" />
          Log Out
        </button>
      </div>
    </div>
  );
};


// --- 3. Main App Component ---

export default function App() {
  const [userToken, setUserToken] = useState(sessionStorage.getItem('critterTrackToken'));
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', message: '' });

  // Function to handle logout and clear state
  const handleLogout = () => {
    sessionStorage.removeItem('critterTrackToken');
    setUserToken(null);
    setIsRegisterView(false); // Reset to login view
  };

  // Axios Interceptor for Authorization Header (runs before every request)
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const token = sessionStorage.getItem('critterTrackToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Cleanup function to remove the interceptor
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [userToken]);


  // Helper function to render the auth/reg forms
  const renderAuthContent = () => (
    <div className="flex flex-col items-center w-full max-w-sm">
      <AuthForm 
        isRegister={isRegisterView} 
        setToken={setUserToken} 
        setIsRegisterView={setIsRegisterView}
        setShowModal={setShowModal}
        setModalMessage={setModalMessage}
      />
      
      <button 
        onClick={() => setIsRegisterView(!isRegisterView)}
        className="mt-4 text-accent hover:text-accent/80 text-sm font-medium flex items-center"
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
    <div className="min-h-screen bg-page-bg p-6 flex flex-col items-center font-sans">
      
      {/* Global Message Modal */}
      {showModal && (
        <ModalMessage 
          title={modalMessage.title} 
          message={modalMessage.message} 
          onClose={() => setShowModal(false)}
        />
      )}
      
      <header className="py-8 w-full max-w-6xl text-center">
        <img
          src="/logo.png" // Update this path if your logo is elsewhere!
          alt="CritterTrack Pedigree App Logo"
          className="mx-auto h-24 sm:h-40"
        />
        <p className="text-lg text-gray-500 mt-2">
          {userToken ? 'Welcome back! Manage your registered critters.' : 'Please sign in or register to continue.'}
        </p>
      </header>

      <main className="flex-grow p-4 w-full flex justify-center">
        {userToken ? (
          <Dashboard onLogout={handleLogout} />
        ) : (
          renderAuthContent()
        )}
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-400 w-full max-w-6xl">
        CritterTrack &copy; {new Date().getFullYear()} | Deployed via Vercel
      </footer>
    </div>
  );
}