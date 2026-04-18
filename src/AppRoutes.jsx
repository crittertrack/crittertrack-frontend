import React, { Suspense, lazy } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

// Lazy-loaded views — each page is only downloaded when first visited
const AnimalList = lazy(() => import('./components/AnimalList'));
const DonationView = lazy(() => import('./components/Donation/DonationView'));
const Marketplace = lazy(() => import('./components/Marketplace'));
const AnimalTree = lazy(() => import('./components/AnimalTree'));
const ProfileView = lazy(() => import('./components/Profile/ProfileView'));
const CommunityPage = lazy(() => import('./components/Community/CommunityPage'));
const BreederDirectory = lazy(() => import('./components/PublicProfile/BreederDirectory'));
const LitterManagement = lazy(() => import('./components/LitterManagement'));
const BudgetingTab = lazy(() => import('./components/BudgetingTab'));
const MouseGeneticsCalculator = lazy(() => import('./components/MouseGeneticsCalculator'));
const SpeciesSelector = lazy(() => import('./components/Modals/SpeciesModals').then(m => ({ default: m.SpeciesSelector })));
const SpeciesManager = lazy(() => import('./components/Modals/SpeciesModals').then(m => ({ default: m.SpeciesManager })));
const AnimalForm = lazy(() => import('./components/AnimalForm'));
const PrivateAnimalDetail = lazy(() => import('./components/AnimalDetail/PrivateAnimalDetail'));
const ViewOnlyPrivateAnimalDetail = lazy(() => import('./components/AnimalDetail/ViewOnlyPrivateAnimalDetail'));

const PageLoader = () => (
    <div className="w-full flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
);

/**
 * AppRoutes Component
 * Centralizes all route definitions (21 routes) previously scattered in app.jsx
 * 
 * Props:
 * - authToken, userProfile, fetchUserProfile
 * - showModalMessage, navigate
 * - All state setters and handlers from app.jsx hooks
 */
export function AppRoutes({
  // Auth
  authToken,
  userProfile,
  setUserProfile,
  fetchUserProfile,
  showModalMessage,
  
  // Modals
  modals,
  setShowMessages,
  setSelectedConversation,
  setBudgetModalOpen,
  
  // Animal Management
  myAnimalsForCalculator,
  cachedLitters,
  setCachedLitters,
  litterCacheTimestamp,
  setLitterCacheTimestamp,
  animalToView,
  animalToEdit,
  handleViewAnimal,
  handleEditAnimal,
  handleSaveAnimal,
  handleDeleteAnimal,
  handleBackFromAnimal,
  handleCloseAllAnimals,
  handleArchiveAnimal,
  privateAnimalInitialTab,
  privateBetaView,
  editReturnPathRef,
  
  // UI State
  showArchiveScreen,
  setShowArchiveScreen,
  archivedAnimals,
  setArchivedAnimals,
  soldTransferredAnimals,
  setSoldTransferredAnimals,
  archiveLoading,
  setArchiveLoading,
  
  // Breeding Lines
  breedingLineDefs,
  animalBreedingLines,
  saveBreedingLineDefs,
  toggleAnimalBreedingLine,
  BL_PRESETS_APP,
  
  // Transfer
  preSelectedTransferAnimal,
  preSelectedTransactionType,
  setPreSelectedTransferAnimal,
  setPreSelectedTransactionType,
  setTransferAnimal,
  setShowTransferModal,
  
  // Species Management
  speciesToAdd,
  setSpeciesToAdd,
  speciesOptions,
  setSpeciesOptions,
  speciesConfigs,
  speciesSearchTerm,
  setSpeciesSearchTerm,
  speciesCategoryFilter,
  setSpeciesCategoryFilter,
  
  // Image Viewing
  setShowImageModal,
  setEnlargedImageUrl,
  
  // Transfer Modal
  showTransferModal,
  transferAnimal,
  
  // UI Components
  X,
  Search,
  Loader2,
  LoadingSpinner,
  PlusCircle,
  ArrowLeft,
  Save,
  Trash2,
  RotateCcw,
  
  // Constants
  GENDER_OPTIONS,
  STATUS_OPTIONS,
  
  // Components
  AnimalImageUpload,
  
  // API
  API_BASE_URL
}) {
  const navigate = useNavigate();

  const handleViewPublicAnimal = (animal) => {
    handleViewAnimal(animal);
  };

  const handleStartConversation = (conversationData) => {
    setSelectedConversation(conversationData);
    setShowMessages(true);
  };

  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Home / List */}
      <Route path="/" element={
        <AnimalList 
          authToken={authToken}
          API_BASE_URL={API_BASE_URL}
          showModalMessage={showModalMessage} 
          onEditAnimal={handleEditAnimal} 
          onViewAnimal={handleViewAnimal}
          navigate={navigate}
          showArchiveScreen={showArchiveScreen}
          setShowArchiveScreen={setShowArchiveScreen}
          archivedAnimals={archivedAnimals}
          setArchivedAnimals={setArchivedAnimals}
          soldTransferredAnimals={soldTransferredAnimals}
          setSoldTransferredAnimals={setSoldTransferredAnimals}
          archiveLoading={archiveLoading}
          setArchiveLoading={setArchiveLoading}
          breedingLineDefs={breedingLineDefs}
          animalBreedingLines={animalBreedingLines}
        />
      } />
      
      {/* List Route (duplicate) */}
      <Route path="/list" element={
        <AnimalList 
          authToken={authToken}
          API_BASE_URL={API_BASE_URL}
          showModalMessage={showModalMessage} 
          onEditAnimal={handleEditAnimal} 
          onViewAnimal={handleViewAnimal}
          navigate={navigate}
          showArchiveScreen={showArchiveScreen}
          setShowArchiveScreen={setShowArchiveScreen}
          archivedAnimals={archivedAnimals}
          setArchivedAnimals={setArchivedAnimals}
          soldTransferredAnimals={soldTransferredAnimals}
          setSoldTransferredAnimals={setSoldTransferredAnimals}
          archiveLoading={archiveLoading}
          setArchiveLoading={setArchiveLoading}
          breedingLineDefs={breedingLineDefs}
          animalBreedingLines={animalBreedingLines}
        />
      } />

      {/* Donation */}
      <Route path="/donation" element={<DonationView onBack={() => navigate('/')} authToken={authToken} userProfile={userProfile} />} />

      {/* Marketplace */}
      <Route path="/marketplace" element={
        <Marketplace 
          authToken={authToken}
          userProfile={userProfile}
          showModalMessage={showModalMessage}
          onViewAnimal={(animalId) => {
            window.location.href = `/animal/${animalId}`;
          }}
          onViewProfile={(userId) => {
            window.location.href = `/user/${userId}`;
          }}
          onStartConversation={handleStartConversation}
        />
      } />

      {/* Animal Tree */}
      <Route path="/animal-tree/:species" element={
        <AnimalTree
          authToken={authToken}
          userProfile={userProfile}
          showModalMessage={showModalMessage}
          onViewAnimal={handleViewAnimal}
          onBack={() => navigate('/')}
        />
      } />

      {/* Profile */}
      <Route path="/profile" element={
        <ProfileView 
          userProfile={userProfile} 
          showModalMessage={showModalMessage} 
          fetchUserProfile={fetchUserProfile} 
          authToken={authToken} 
          onProfileUpdated={(updatedUser) => {
            if (updatedUser && setUserProfile) {
              setUserProfile(updatedUser);
            }
            fetchUserProfile(authToken);
          }} 
          breedingLineDefs={breedingLineDefs} 
          animalBreedingLines={animalBreedingLines} 
          saveBreedingLineDefs={saveBreedingLineDefs} 
          toggleAnimalBreedingLine={toggleAnimalBreedingLine} 
          BL_PRESETS_APP={BL_PRESETS_APP} 
        />
      } />

      {/* Community */}
      <Route path="/community" element={
        <CommunityPage
          authToken={authToken}
          API_BASE_URL={API_BASE_URL}
          userProfile={userProfile}
        />
      } />

      {/* Breeder Directory */}
      <Route path="/breeder-directory" element={
        <BreederDirectory
          authToken={authToken}
          API_BASE_URL={API_BASE_URL}
          onBack={() => navigate('/')}
        />
      } />

      {/* Litters */}
      <Route path="/litters" element={
        <LitterManagement
          authToken={authToken}
          API_BASE_URL={API_BASE_URL}
          userProfile={userProfile}
          showModalMessage={showModalMessage}
          onViewAnimal={handleViewAnimal}
          handleViewAnimal={handleViewAnimal}
          handleEditAnimal={handleEditAnimal}
          speciesOptions={speciesOptions}
          cachedLitters={cachedLitters}
          setCachedLitters={setCachedLitters}
          litterCacheTimestamp={litterCacheTimestamp}
          setLitterCacheTimestamp={setLitterCacheTimestamp}
        />
      } />

      {/* Budget */}
      <Route path="/budget" element={
        <BudgetingTab
          authToken={authToken}
          API_BASE_URL={API_BASE_URL}
          showModalMessage={showModalMessage}
          preSelectedAnimal={preSelectedTransferAnimal}
          preSelectedType={preSelectedTransactionType}
          onAddModalOpen={() => setBudgetModalOpen(true)}
        />
      } />

      {/* Genetics Calculator */}
      <Route path="/genetics-calculator" element={
        <MouseGeneticsCalculator
          API_BASE_URL={API_BASE_URL}
          authToken={authToken}
          myAnimals={myAnimalsForCalculator}
          userRole={userProfile?.role}
        />
      } />

      {/* Select Species */}
      <Route path="/select-species" element={
        <SpeciesSelector 
          speciesOptions={speciesOptions} 
          onSelectSpecies={(species) => { 
            setSpeciesToAdd(species); 
            navigate('/add-animal'); 
          }} 
          onManageSpecies={() => navigate('/manage-species')}
          searchTerm={speciesSearchTerm}
          setSearchTerm={setSpeciesSearchTerm}
          categoryFilter={speciesCategoryFilter}
          setCategoryFilter={setSpeciesCategoryFilter}
        />
      } />

      {/* Manage Species */}
      <Route path="/manage-species" element={
        <SpeciesManager 
          speciesOptions={speciesOptions} 
          setSpeciesOptions={setSpeciesOptions} 
          onCancel={() => navigate('/select-species')}
          showModalMessage={showModalMessage}
          authToken={authToken}
          API_BASE_URL={API_BASE_URL}
        />
      } />

      {/* Add Animal */}
      <Route path="/add-animal" element={
        !speciesToAdd ? (
          <SpeciesSelector
            speciesOptions={speciesOptions}
            onSelectSpecies={(species) => {
              setSpeciesToAdd(species);
              navigate('/add-animal');
            }}
            onManageSpecies={() => navigate('/manage-species')}
            searchTerm={speciesSearchTerm}
            setSearchTerm={setSpeciesSearchTerm}
            categoryFilter={speciesCategoryFilter}
            setCategoryFilter={setSpeciesCategoryFilter}
          />
        ) : (
          <AnimalForm
            formTitle={`Add New ${speciesToAdd}`}
            animalToEdit={null}
            species={speciesToAdd}
            onSave={handleSaveAnimal}
            onCancel={() => { navigate('/'); setSpeciesToAdd(null); }}
            onDelete={null}
            authToken={authToken}
            showModalMessage={showModalMessage}
            API_BASE_URL={API_BASE_URL}
            userProfile={userProfile}
            speciesConfigs={speciesConfigs}
            X={X}
            Search={Search}
            Loader2={Loader2}
            LoadingSpinner={LoadingSpinner}
            PlusCircle={PlusCircle}
            ArrowLeft={ArrowLeft}
            Save={Save}
            Trash2={Trash2}
            RotateCcw={RotateCcw}
            GENDER_OPTIONS={GENDER_OPTIONS}
            STATUS_OPTIONS={STATUS_OPTIONS}
            AnimalImageUpload={AnimalImageUpload}
          />
        )
      } />

    </Routes>
    </Suspense>
  );
}

export default AppRoutes;
