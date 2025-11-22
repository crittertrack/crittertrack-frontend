import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, Trash2, Edit, Save, PlusCircle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';

// --- Global Constants ---
const API_BASE_URL = 'https://crittertrack-pedigree-production.up.railway.app/api';

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
    const [personalName, setPersonalName] = useState(''); 
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
          ? { email, password, personalName: personalName } // FIX: Key is now 'personalName'
          : { email, password };
  
       const response = await axios.post(endpoint, payload);

        // --- CRITICAL FIX: Split Logic for Registration vs. Login ---
        if (isRegisterView) {
            // 1. REGISTRATION SUCCESS: Show modal with success message from backend
            showModalMessage('Registration Successful', response.data.message);
            
            // 2. Switch the component state back to the login view 
            //    (toggleView flips the boolean state 'isRegisterView' from true to false)
            toggleView(); 

        } else {
            // LOGIN SUCCESS/FAILURE CHECK
            if (response.data.token) {
                // LOGIN SUCCESS
                setAuthToken(response.data.token);
                setUserId(response.data.userId);
                showModalMessage('Success!', 'Login successful. Welcome back!');
            } else {
                // LOGIN ERROR: Should only happen if login returns 200/201 without a token
                showModalMessage('Login Error', response.data.message || 'Login failed due to missing authentication token.');
            }
        }
        // --- END CRITICAL FIX ---
  
      } catch (error) { // <--- FIXED: Added missing catch block
          const msg = error.response?.data?.message || 'Failed to communicate with the server. Try again.';
          showModalMessage('Request Error', msg);
      } finally { // <--- FIXED: Added missing finally block and logic
          setLoading(false);
      }
    }; // <--- FIXED: Added closing brace for handleSubmit function
  
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
              
              {/* Reduced vertical spacing between form fields: space-y-3 */}
              <form className="space-y-3" onSubmit={handleSubmit}>
                
                {/* Personal Name Field - Only for Registration */}
                {isRegisterView && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Personal Name <span className="text-red-500">*</span>
                    </label>
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
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
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
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
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
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
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
                    {loading ? 'Processing...' : isRegisterView ? 'Register' : 'Log In'}
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

// --- Animal Management Components ---

const AnimalForm = ({ animalToEdit, onSave, onCancel, authToken, showModalMessage }) => {
    const isEditing = !!animalToEdit;
    const [formData, setFormData] = useState({
      name: animalToEdit?.name || '',
      species: animalToEdit?.species || SPECIES_OPTIONS[0],
      gender: animalToEdit?.gender || 'Unknown',
      birthDate: animalToEdit?.birthDate ? new Date(animalToEdit.birthDate).toISOString().split('T')[0] : '', // Format date for input
      color: animalToEdit?.color || '',
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
        const url = isEditing 
          ? `${API_BASE_URL}/animals/${animalToEdit._id}`
          : `${API_BASE_URL}/animals`;
        
        const method = isEditing ? axios.put : axios.post;
  
        const response = await method(url, formData, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
  
        showModalMessage('Success', isEditing ? 'Animal updated successfully!' : 'Animal created successfully!');
        onSave(response.data); // Signal main app to refresh list
      } catch (error) {
        const msg = error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} animal.`;
        showModalMessage('Request Error', msg);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="p-6 bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          {isEditing ? <Edit size={24} className="mr-2" /> : <PlusCircle size={24} className="mr-2" />}
          {isEditing ? `Edit Critter: ${animalToEdit.name}` : 'Add New Critter'}
        </h2>
  
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Row 1: Name and Species */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
              <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-accent focus:border-accent" />
            </div>
            <div>
              <label htmlFor="species" className="block text-sm font-medium text-gray-700">Species <span className="text-red-500">*</span></label>
              <select id="species" name="species" required value={formData.species} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-accent focus:border-accent bg-white">
                {SPECIES_OPTIONS.map(species => (
                  <option key={species} value={species}>{species}</option>
                ))}
              </select>
            </div>
          </div>
  
          {/* Row 2: Gender and Birth Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-accent focus:border-accent bg-white">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Birth Date</label>
              <input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-accent focus:border-accent" />
            </div>
          </div>
  
          {/* Row 3: Color/Variety */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color / Variety</label>
            <input type="text" id="color" name="color" value={formData.color} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-accent focus:border-accent" />
          </div>
  
          {/* Action Buttons */}
          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-150 shadow-md"
            >
              <ArrowLeft size={18} className="mr-2" /> Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg text-white bg-accent hover:bg-accent/80 transition duration-150 shadow-md disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Save size={18} className="mr-2" />
              )}
              {isEditing ? 'Save Changes' : 'Create Critter'}
            </button>
          </div>
        </form>
      </div>
    );
  };
  
const AnimalList = ({ authToken, showModalMessage, onEditAnimal, onSetCurrentView }) => {
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(false);
  
    // Fetch animals using useCallback to memoize the function
    const fetchAnimals = useCallback(async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/animals`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setAnimals(response.data);
      } catch (error) {
        const msg = error.response?.data?.message || 'Failed to fetch animal list.';
        showModalMessage('Request Error', msg);
      } finally {
        setLoading(false);
      }
    }, [authToken, showModalMessage]);
  
    // Fetch animals on component mount
    useEffect(() => {
      fetchAnimals();
    }, [fetchAnimals]);
  
    const handleDelete = async (animalId) => {
        // Simple confirmation before delete
        if (!window.confirm("Are you sure you want to delete this critter? This cannot be undone.")) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/animals/${animalId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            showModalMessage('Success', 'Critter deleted successfully!');
            // Update the list immediately after successful deletion
            setAnimals(prev => prev.filter(animal => animal._id !== animalId));
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to delete critter.';
            showModalMessage('Request Error', msg);
        }
    };
  
    if (loading) {
      return (
        <div className="text-center p-20">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-gray-600">Loading critter data...</p>
        </div>
      );
    }
  
    return (
      <div className="p-6 bg-white rounded-xl shadow-xl w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Cat size={24} className="mr-2 text-primary" />
                Your Critters ({animals.length})
            </h2>
            <div className='flex space-x-3'>
                <button
                    onClick={fetchAnimals}
                    className="flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-150 shadow-sm"
                >
                    <RefreshCw size={16} className="mr-1" />
                    Refresh
                </button>
                <button
                    onClick={() => onSetCurrentView('add')}
                    className="flex items-center px-4 py-2 text-sm font-bold rounded-lg text-black bg-primary hover:bg-primary-dark transition duration-150 shadow-md"
                >
                    <PlusCircle size={18} className="mr-2" />
                    Add New
                </button>
            </div>
        </div>
  
        {animals.length === 0 ? (
          <div className="text-center p-10 border border-dashed border-gray-300 rounded-lg">
            <Cat size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">You don't have any critters registered yet. Click "Add New" to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Species</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birth Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {animals.map((animal) => (
                  <tr key={animal._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{animal.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.species}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{animal.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => onEditAnimal(animal)}
                        className="text-primary hover:text-primary-dark mr-3 transition duration-150"
                        title="Edit Critter"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(animal._id)}
                        className="text-red-600 hover:text-red-800 transition duration-150"
                        title="Delete Critter"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

// --- Main App Component ---
export default function App() {
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isRegisterView, setIsRegisterView] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: '', message: '' });
  
  // State for the main app view: 'list', 'add', 'edit'
  const [currentView, setCurrentView] = useState('list'); 
  const [animalToEdit, setAnimalToEdit] = useState(null); // Holds animal data for editing

  // Helper function to show modals
  const showModalMessage = (title, message) => {
    setModalMessage({ title, message });
    setShowModal(true);
  };

  // Helper function to reset and view the list
  const handleViewList = () => {
    setCurrentView('list');
    setAnimalToEdit(null); // Clear editing state
  };

  // Handler passed to AnimalList to initiate edit mode
  const handleEditAnimal = (animal) => {
    setAnimalToEdit(animal);
    setCurrentView('edit');
  };

  // Handler for form submission completion
  const handleFormSave = () => {
    handleViewList(); // Go back to list view
    // The AnimalList component will automatically re-fetch data due to the useEffect logic
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

  // Determine which component to render based on currentView
  const renderMainContent = () => {
    switch (currentView) {
      case 'add':
        return (
          <AnimalForm
            animalToEdit={null} // null for adding
            onSave={handleFormSave}
            onCancel={handleViewList}
            authToken={authToken}
            showModalMessage={showModalMessage}
          />
        );
      case 'edit':
        return (
          <AnimalForm
            animalToEdit={animalToEdit}
            onSave={handleFormSave}
            onCancel={handleViewList}
            authToken={authToken}
            showModalMessage={showModalMessage}
          />
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

      {/* Main Content Area */}
      <main className="w-full max-w-4xl">
        {renderMainContent()}
      </main>
    </div>
  );
}