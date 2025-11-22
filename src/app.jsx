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

// Custom logo component using the public/logo.png
const CustomAppLogo = ({ size = "w-10 h-10" }) => (
  <div className={`flex items-center justify-center ${size} bg-secondary rounded-full text-white shadow-inner`}>
    <Cat className="text-gray-800" size={size === "w-8 h-8" ? 18 : 24} />
  </div>
);

// Loading Indicator
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="animate-spin text-primary-dark mr-2" size={24} />
    <span className="text-gray-600">Loading...</span>
  </div>
);

// --- Component: User Authentication (Login/Register) ---
const AuthView = ({ onLoginSuccess, showModalMessage }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [personalName, setPersonalName] = useState('');
  const [breederName, setBreederName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const payload = isRegister 
      ? { email, password, personalName, breederName, showBreederName: true } 
      : { email, password };

    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
      
      if (isRegister) {
        showModalMessage('Registration Success', 'Your account has been created. Please log in.');
        setIsRegister(false);
      } else {
        // Successful login: pass token to parent component
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

  const formTitle = isRegister ? 'Register New Account' : 'Breeder Login';

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex justify-center mb-6">
        <CustomAppLogo size="w-16 h-16" />
      </div>
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">{formTitle}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <>
            <input
              type="text"
              placeholder="Your Name (e.g., John Doe)"
              value={personalName}
              onChange={(e) => setPersonalName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
            <input
              type="text"
              placeholder="Breeder Name (e.g., Doe Rattery)"
              value={breederName}
              onChange={(e) => setBreederName(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
        <input
          type="password"
          placeholder="Password"
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
          onClick={() => setIsRegister(!isRegister)}
          className="text-sm text-gray-500 hover:text-primary transition duration-150"
        >
          {isRegister ? 'Already have an account? Log In' : "Don't have an account? Register Here"}
        </button>
      </div>
    </div>
  );
};

// --- Component: Profile View (Stub) ---
const ProfileView = ({ userProfile, showModalMessage, onSetCurrentView }) => {
    // Determine the name to display
    const displayName = userProfile.showBreederName && userProfile.breederName 
        ? userProfile.breederName 
        : userProfile.personalName;

    return (
        <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Settings size={24} className="mr-3 text-primary-dark" />
                Profile Settings
            </h2>
            <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-700">Display Name:</p>
                    <p className="text-2xl font-bold text-gray-900">{displayName}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {userProfile.showBreederName ? "Breeder Name is currently public." : "Personal Name is currently displayed."}
                    </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-700">Email:</p>
                    <p className="text-xl text-gray-800">{userProfile.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-700">Personal ID:</p>
                    <p className="text-xl text-gray-800">{userProfile.id_public}</p>
                    <p className="text-sm text-gray-500 mt-1">This is your public-facing ID.</p>
                </div>
                {/* TODO: Add profile update form here */}
            </div>
            <button
                onClick={() => showModalMessage("Feature Not Ready", "Profile editing is coming soon!")}
                className="mt-6 bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 shadow-md"
            >
                Edit Profile (Coming Soon)
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
  const [userProfile, setUserProfile] = useState(null); // NEW STATE: User Profile
  const [currentView, setCurrentView] = useState('list'); // 'list', 'add-animal', 'edit-animal', 'profile', 'litters', 'pedigree'
  const [animalToEdit, setAnimalToEdit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', message: '' });

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
      fetchUserProfile(authToken); // Fetch profile data on authentication
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('authToken');
      setUserProfile(null);
      setCurrentView('list');
    }
  }, [authToken]);


  // NEW FUNCTION: Fetch the user's non-sensitive profile data
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
    if (!authToken) {
      return <AuthView onLoginSuccess={handleLoginSuccess} showModalMessage={showModalMessage} />;
    }

    switch (currentView) {
      case 'profile':
        return <ProfileView userProfile={userProfile} showModalMessage={showModalMessage} onSetCurrentView={setCurrentView} />;
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

  // Logged-in Dashboard Layout
  const displayName = userProfile?.showBreederName && userProfile?.breederName 
    ? userProfile.breederName 
    : userProfile?.personalName || 'User';

  return (
    <div className="min-h-screen bg-page-bg p-6 flex flex-col items-center font-sans">
      {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
      
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center bg-white p-4 rounded-xl shadow-lg mb-6">
        <div className="flex items-center space-x-2">
            <CustomAppLogo size="w-8 h-8" />
            <h1 className="text-2xl font-bold text-gray-800 hidden sm:block">CritterTrack Dashboard</h1>
        </div>

        {authToken && (
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
        )}
      </header>

      {/* Main Content */}
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