import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, Trash2, Edit, Save, PlusCircle, ArrowLeft, Loader2, RefreshCw, XCircle } from 'lucide-react';

// --- Global Constants ---
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
const DEFAULT_SPECIES_OPTIONS = ['Mouse', 'Rat', 'Hamster'];
// Key for local storage is now a base, the full key will be generated in Dashboard
const LOCAL_STORAGE_BASE_KEY = 'critterTrackCustomSpecies_'; 

// --- Local Storage Helpers ---

/**
 * Loads custom species from local storage based on a unique user key.
 * @param {string} userIdKey - A unique string (e.g., user ID or token prefix) for the current user.
 * @returns {string[]} An array of custom species strings.
 */
const loadCustomSpecies = (userIdKey) => {
  const key = LOCAL_STORAGE_BASE_KEY + userIdKey;
  try {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error("Error loading custom species from localStorage:", error);
    return [];
  }
};

/**
 * Saves the custom species list to local storage based on a unique user key.
 * @param {string[]} speciesList - The updated list of custom species.
 * @param {string} userIdKey - A unique string (e.g., user ID or token prefix) for the current user.
 */
const saveCustomSpecies = (speciesList, userIdKey) => {
  const key = LOCAL_STORAGE_BASE_KEY + userIdKey;
  try {
    localStorage.setItem(key, JSON.stringify(speciesList));
  } catch (error) {
    console.error("Error saving custom species to localStorage:", error);
  }
};

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

/**
 * @typedef {object} Critter
 * @property {number} id
 * @property {string} name
 * @property {number} age
 * @property {string} gender
 * @property {string} owner
 * @property {string} species
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
    const payload = isRegister 
      ? { email, password, personalName: name, breederName: breederName || null } 
      : { email, password };

    try {
      const response = await axios.post(endpoint, payload);

      if (response.data.token) {
        sessionStorage.setItem('critterTrackToken', response.data.token);
        setToken(response.data.token);
      } else {
        if (isRegister) {
            setShowModal(true);
            setModalMessage({
                title: 'Registration Success',
                message: 'Your account has been created successfully. Please log in now.'
            });
            setIsRegisterView(false); 
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
            label="Personal Name" 
            value={name} 
            onChange={setName} 
            required 
            disabled={isLoading}
          />
          
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
    gender: 'Male', 
    owner: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!initialCritter && !!initialCritter.id;

  const handleChange = (field, value) => {
    setCritter(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    // Ensure age is an integer for the API call
    const payload = { 
        ...critter, 
        age: parseInt(critter.age, 10) 
    };

    try {
      if (isEditing) {
        await axios.put(`${API_BASE_URL}/critters/${critter.id}`, payload, config);
      } else {
        await axios.post(`${API_BASE_URL}/critters`, payload, config);
      }
      onCritterSaved();
      onCancel(); 
    } catch (error) {
      console.error('Critter Save Error:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Species field is disabled if species is already set (after selection or when editing an existing critter)
  const isSpeciesDisabled = isLoading || (!!critter.species && !isEditing); 

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full max-w-md">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">{isEditing ? 'Edit Critter' : `Add New ${critter.species || 'Critter'}`}</h3>
      <form onSubmit={handleSubmit}>
        
        <InputField id="critterName" label="Name" value={critter.name} onChange={(val) => handleChange('name', val)} required disabled={isLoading} />
        
        <InputField 
          id="critterSpecies" 
          label="Species" 
          value={critter.species} 
          onChange={(val) => handleChange('species', val)} 
          required 
          disabled={isSpeciesDisabled} // Ensures species cannot be edited if set
        />
        
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
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${critter.name} (${critter.species})?`)) {
        setIsLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/critters/${critter.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onCritterDeleted(critter.id);
        } catch (error) {
            console.error('Critter Delete Error:', error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
    }
  };
  
  const handleEditClick = () => {
      onCritterUpdated(critter); 
  };
  
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
        <p className="text-sm text-gray-600 mb-3">Species: {critter.species}</p>
        
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

// UPDATED: Species Selection Component
const SpeciesSelector = ({ critters, onSelectSpecies, onCancel, setShowModal, setModalMessage, userIdKey }) => {
  const [customSpecies, setCustomSpecies] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [localCustomSpecies, setLocalCustomSpecies] = useState([]);
  
  // Load custom species on mount using the unique key
  useEffect(() => {
    if (userIdKey) {
        setLocalCustomSpecies(loadCustomSpecies(userIdKey));
    }
  }, [userIdKey]);

  const handleSelect = (species) => {
    onSelectSpecies(species);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const newSpecies = customSpecies.trim();
    if (newSpecies && ![...DEFAULT_SPECIES_OPTIONS, ...localCustomSpecies].map(s => s.toLowerCase()).includes(newSpecies.toLowerCase())) {
        const newSpeciesList = [...localCustomSpecies, newSpecies];
        setLocalCustomSpecies(newSpeciesList);
        saveCustomSpecies(newSpeciesList, userIdKey); // Use unique key when saving
        setCustomSpecies('');
        setShowCustomInput(false);
        onSelectSpecies(newSpecies);
    } else {
        setShowModal(true);
        setModalMessage({
            title: 'Species Error',
            message: 'Species name is invalid or already exists.'
        });
    }
  };

  const handleDeleteCustomSpecies = (speciesToDelete) => {
    // Check if any existing critters use this species
    const linkedCritters = critters.filter(c => c.species.toLowerCase() === speciesToDelete.toLowerCase());

    if (linkedCritters.length > 0) {
        setShowModal(true);
        setModalMessage({
            title: 'Cannot Delete Species',
            message: `You must first delete or re-assign the species of ${linkedCritters.length} critter(s) currently linked to "${speciesToDelete}" before deleting it.`
        });
        return;
    }

    if (window.confirm(`Are you sure you want to permanently delete the custom species "${speciesToDelete}"?`)) {
        const newSpeciesList = localCustomSpecies.filter(s => s !== speciesToDelete);
        setLocalCustomSpecies(newSpeciesList);
        saveCustomSpecies(newSpeciesList, userIdKey); // Use unique key when saving
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-lg">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Select Species</h3>
      
      {/* Default Species */}
      <div className="grid grid-cols-2 gap-4 mb-6 border-b border-gray-200 pb-6">
        {DEFAULT_SPECIES_OPTIONS.map(species => (
          <button
            key={species}
            onClick={() => handleSelect(species)}
            className="flex items-center justify-center p-4 border border-gray-300 rounded-lg text-lg font-semibold text-gray-700 hover:bg-gray-100 transition duration-150"
          >
            {species}
          </button>
        ))}
      </div>

      {/* Custom Species */}
      {localCustomSpecies.length > 0 && (
          <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Your Custom Species:</p>
              <div className="grid grid-cols-2 gap-3">
                  {localCustomSpecies.map(species => (
                    <div key={species} className="relative group">
                        <button
                          onClick={() => handleSelect(species)}
                          className="w-full flex items-center justify-between p-3 border border-indigo-300 bg-indigo-50 rounded-lg text-md font-medium text-indigo-700 hover:bg-indigo-100 transition duration-150 pr-10"
                        >
                            <span className='truncate'>{species}</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCustomSpecies(species); }}
                          className="absolute right-0 top-0 bottom-0 px-2 flex items-center text-red-400 hover:text-red-600 transition duration-150"
                          title={`Delete custom species: ${species}`}
                        >
                            <XCircle size={18} />
                        </button>
                    </div>
                  ))}
              </div>
          </div>
      )}

      {/* Custom Species Input */}
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
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 px-6 rounded-xl transition duration-150 whitespace-nowrap"
            >
              Cancel
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


const Dashboard = ({ onLogout, setShowModal, setModalMessage }) => {
  /** @type {[Critter[], React.Dispatch<React.SetStateAction<Critter[]>>]} */
  const [critters, setCritters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  /** @type {[Critter | null, React.Dispatch<React.SetStateAction<Critter | null>>]} */
  const [editingCritter, setEditingCritter] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState(null); 
  
  const token = sessionStorage.getItem('critterTrackToken');

  // NEW: Create a unique key for local storage based on the first few chars of the token
  // This is a proxy for the user ID/email that is unique per user session.
  const userIdKey = token ? token.substring(0, 10) : 'GUEST';

  const fetchCritters = useCallback(async () => {
    if (!token) {
        setError("Authentication token missing in session storage.");
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
  }, [token]);

  useEffect(() => {
    fetchCritters();
  }, [fetchCritters]); 

  const handleEditCritter = (critter) => {
    setEditingCritter(critter);
    setSelectedSpecies(null);
    setIsFormVisible(true);
  };
  
  const handleDataChange = () => {
    fetchCritters(); 
  };
  
  const handleCancelForm = () => {
      setIsFormVisible(false);
      setEditingCritter(null);
      setSelectedSpecies(null);
  };
  
  const handleSpeciesSelected = (species) => {
      setSelectedSpecies(species);
  };
  
  const startAddCritterFlow = () => {
      setEditingCritter(null);
      setSelectedSpecies(null);
      setIsFormVisible(true);
  };
  
  const handleCritterDeleted = (id) => {
      setCritters(prevCritters => prevCritters.filter(c => c.id !== id));
  };


  if (isFormVisible) {
      if (!editingCritter && !selectedSpecies) {
          return (
              <SpeciesSelector 
                  critters={critters}
                  onSelectSpecies={handleSpeciesSelected} 
                  onCancel={handleCancelForm} 
                  setShowModal={setShowModal}
                  setModalMessage={setModalMessage}
                  userIdKey={userIdKey} // PASS THE UNIQUE KEY FOR LOCAL STORAGE
              />
          );
      }
      
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
                  initialCritter={editingCritter || { species: selectedSpecies }}
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
              onClick={startAddCritterFlow}
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
                onCritterUpdated={handleEditCritter}
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

  const handleLogout = () => {
    sessionStorage.removeItem('critterTrackToken');
    setUserToken(null);
    setIsRegisterView(false);
  };

  useEffect(() => {
    // Axios interceptor to automatically attach the token to all requests
    const interceptor = axios.interceptors.request.use((config) => {
      const token = sessionStorage.getItem('critterTrackToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [userToken]);


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
          src="/logo.png"
          alt="CritterTrack Pedigree App Logo"
          className="mx-auto h-24 sm:h-40"
        />
        <p className="text-lg text-gray-500 mt-2">
          {userToken ? 'Welcome back! Manage your registered critters.' : 'Please sign in or register to continue.'}
        </p>
      </header>

      <main className="flex-grow p-4 w-full flex justify-center">
        {userToken ? (
          <Dashboard 
            onLogout={handleLogout} 
            setShowModal={setShowModal}
            setModalMessage={setModalMessage}
          />
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