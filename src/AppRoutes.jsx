import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

// Views
import AnimalList from './components/AnimalList';
import DonationView from './components/DonationView';
import Marketplace from './components/Marketplace';
import FamilyTree from './components/FamilyTree';
import AnimalTree from './components/AnimalTree';
import ProfileView from './components/ProfileView';
import CommunityPage from './components/CommunityPage';
import BreederDirectory from './components/BreederDirectory';
import LitterManagement from './components/LitterManagement';
import BudgetingTab from './components/BudgetingTab';
import MouseGeneticsCalculator from './components/MouseGeneticsCalculator';
import SpeciesSelector from './components/SpeciesSelector';
import SpeciesManager from './components/SpeciesManager';
import AnimalForm from './components/AnimalForm';
import PrivateAnimalDetail from './components/PrivateAnimalDetail';
import ViewOnlyPrivateAnimalDetail from './components/ViewOnlyPrivateAnimalDetail';

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
  fetchUserProfile,
  
  // Modals
  modals,
  setShowMessages,
  setSelectedConversation,
  setBudgetModalOpen,
  
  // Animal Management
  myAnimalsForCalculator,
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
    <Routes>
      {/* Home / List */}
      <Route path="/" element={
        <AnimalList 
          authToken={authToken}
          API_BASE_URL={API_BASE_URL}
          showModalMessage={() => {}} 
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
          showModalMessage={() => {}} 
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
          showModalMessage={() => {}}
          onViewAnimal={(animalId) => {
            window.location.href = `/animal/${animalId}`;
          }}
          onViewProfile={(userId) => {
            window.location.href = `/user/${userId}`;
          }}
          onStartConversation={handleStartConversation}
        />
      } />

      {/* Family Tree */}
      <Route path="/family-tree" element={
        userProfile?.id_public === 'CTU2' ? (
          <FamilyTree
            authToken={authToken}
            userProfile={userProfile}
            showModalMessage={() => {}}
            onViewAnimal={handleViewAnimal}
            onBack={() => navigate('/')}
          />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Access Restricted</h2>
            <p>The Family Tree feature is currently in testing and only available to select users.</p>
            <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
              Back to Home
            </button>
          </div>
        )
      } />

      {/* Animal Tree */}
      <Route path="/animal-tree/:species" element={
        <AnimalTree
          authToken={authToken}
          userProfile={userProfile}
          showModalMessage={() => {}}
          onViewAnimal={handleViewAnimal}
          onBack={() => navigate('/')}
        />
      } />

      {/* Profile */}
      <Route path="/profile" element={
        <ProfileView 
          userProfile={userProfile} 
          showModalMessage={() => {}} 
          fetchUserProfile={fetchUserProfile} 
          authToken={authToken} 
          onProfileUpdated={() => {}} 
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
          showModalMessage={() => {}}
          onViewAnimal={handleViewAnimal}
          speciesOptions={speciesOptions}
        />
      } />

      {/* Budget */}
      <Route path="/budget" element={
        <BudgetingTab
          authToken={authToken}
          API_BASE_URL={API_BASE_URL}
          showModalMessage={() => {}}
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
          showModalMessage={() => {}}
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
            showModalMessage={() => {}}
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

      {/* Edit Animal */}
      <Route path="/edit-animal" element={
        animalToEdit && (
          <AnimalForm 
            formTitle={`Edit ${animalToEdit.name}`}
            animalToEdit={animalToEdit} 
            species={animalToEdit.species} 
            onSave={handleSaveAnimal} 
            onCancel={() => navigate(editReturnPathRef.current || '/')} 
            onDelete={handleDeleteAnimal}
            authToken={authToken} 
            showModalMessage={() => {}}
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

      {/* View Animal */}
      <Route path="/view-animal" element={
        animalToView && (() => {
          const iCurrentlyOwn = animalToView.ownerId_public === userProfile?.id_public;
          
          if (iCurrentlyOwn) {
            return (
              <PrivateAnimalDetail
                animal={animalToView}
                initialTab={privateAnimalInitialTab}
                initialBetaView={privateBetaView}
                onClose={handleBackFromAnimal}
                onCloseAll={handleCloseAllAnimals}
                onEdit={handleEditAnimal}
                onArchive={handleArchiveAnimal}
                API_BASE_URL={API_BASE_URL}
                authToken={authToken}
                setShowImageModal={setShowImageModal}
                setEnlargedImageUrl={setEnlargedImageUrl}
                onUpdateAnimal={() => {}}
                showModalMessage={() => {}}
                onTransfer={(animal) => {
                  setTransferAnimal(animal);
                  setShowTransferModal(true);
                }}
                onViewAnimal={handleViewAnimal}
                onViewPublicAnimal={handleViewPublicAnimal}
                onToggleOwned={() => {}}
                userProfile={userProfile}
                breedingLineDefs={breedingLineDefs}
                animalBreedingLines={animalBreedingLines}
                toggleAnimalBreedingLine={toggleAnimalBreedingLine}
              />
            );
          } else {
            return (
              <ViewOnlyPrivateAnimalDetail
                animal={animalToView}
                initialTab={privateAnimalInitialTab}
                initialBetaView={privateBetaView}
                onClose={handleBackFromAnimal}
                onCloseAll={handleCloseAllAnimals}
                API_BASE_URL={API_BASE_URL}
                authToken={authToken}
                setShowImageModal={setShowImageModal}
                setEnlargedImageUrl={setEnlargedImageUrl}
                showModalMessage={() => {}}
                onViewAnimal={handleViewAnimal}
                breedingLineDefs={breedingLineDefs}
                animalBreedingLines={animalBreedingLines}
                toggleAnimalBreedingLine={toggleAnimalBreedingLine}
              />
            );
          }
        })()
      } />
    </Routes>
  );
}

export default AppRoutes;
