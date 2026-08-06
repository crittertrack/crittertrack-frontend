import React, { Suspense, lazy } from 'react';
import { Route, Routes, useNavigate, Navigate } from 'react-router-dom';

// Lazy-loaded views — each page is only downloaded when first visited
const AnimalList = lazy(() => import('./components/AnimalList'));
const DonationView = lazy(() => import('./components/Donation/DonationView'));
const Marketplace = lazy(() => import('./components/Marketplace'));
const ProfileView = lazy(() => import('./components/Profile/ProfileView'));
const CommunityPage = lazy(() => import('./components/Community/CommunityPage'));
const BreederDirectory = lazy(() => import('./components/PublicProfile/BreederDirectory'));
const LitterManagement = lazy(() => import('./components/LitterManagement'));
const CalendarPage = lazy(() => import('./components/CalendarPage'));
const BudgetingTab = lazy(() => import('./components/BudgetingTab'));
const GeneticsCalculator = lazy(() => import('./components/GeneticsCalculator'));
const SpeciesSelector = lazy(() => import('./components/Modals/SpeciesModals').then(m => ({ default: m.SpeciesSelector })));
const SpeciesManager = lazy(() => import('./components/Modals/SpeciesModals').then(m => ({ default: m.SpeciesManager })));
const AnimalForm = lazy(() => import('./components/AnimalForm'));

const TutorialsPage = lazy(() => import('./components/tools/TutorialsPage'));
const ResourcesPage = lazy(() => import('./components/tools/ResourcesPage'));
const SuppliesPage = lazy(() => import('./components/SuppliesPage'));
const COICalculatorPage = lazy(() => import('./components/tools/COICalculatorPage'));
const TargetOutcomePage = lazy(() => import('./components/tools/TargetOutcomePage'));
const FamilyTreePage = lazy(() => import('./components/tools/FamilyTreePage'));
const ReportPage = lazy(() => import('./components/ReportPage'));


// New Contact pages for refactor
const ContactsListPage = lazy(() => import('./components/Contacts/ContactsListPage'));
const ContactDetailPage = lazy(() => import('./components/Contacts/ContactDetailPage'));
const ContactOverview = lazy(() => import('./components/Contacts/Overview'));
const ContactOwnedAnimals = lazy(() => import('./components/Contacts/OwnedAnimals'));
const ContactBredAnimals = lazy(() => import('./components/Contacts/BredAnimals'));
const AddContactPage = lazy(() => import('./components/Contacts/AddContactPage'));
const EditContactPage = lazy(() => import('./components/Contacts/EditContactPage'));

const PageLoader = () => (
    <div className="w-full flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
);

// Catches errors thrown while rendering/lazy-loading a route (e.g. a page component
// failing to download after a new deployment shipped a fresh chunk hash). Without this,
// a failed chunk load throws uncaught and the page just hangs/stays blank forever —
// the user has to know to manually refresh. Most of these errors are a stale cached
// bundle referencing an old chunk that no longer exists on the server, so we try one
// automatic reload first (guarded by sessionStorage so we don't reload-loop), then fall
// back to a friendly retry screen for anything else.
class RouteErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Route failed to load:', error, errorInfo);

        const isChunkLoadError = /Loading chunk|dynamically imported module|ChunkLoadError/i.test(
            `${error?.name || ''} ${error?.message || ''}`
        );

        // Guard by timestamp rather than a one-time flag, so a *new* chunk error later in the
        // same session (e.g. another deploy went out while the tab was still open) can still
        // trigger one more automatic reload, while back-to-back failures within a few seconds
        // don't cause a reload loop.
        const lastAttempt = Number(sessionStorage.getItem('ct_chunk_reload_attempted') || 0);
        if (isChunkLoadError && Date.now() - lastAttempt > 10000) {
            sessionStorage.setItem('ct_chunk_reload_attempted', String(Date.now()));
            window.location.reload();
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full flex flex-col items-center justify-center py-24 px-4 text-center gap-3">
                    <p className="text-gray-700 dark:text-dark-text font-semibold">This page failed to load.</p>
                    <p className="text-sm text-gray-500 dark:text-dark-text-muted max-w-sm">
                        This can happen after an app update. Reloading usually fixes it.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary dark:bg-dark-primary text-black rounded-lg font-semibold hover:bg-primary-dark transition"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

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
  setAnimalBreedingLines,
  saveBreedingLineDefs,
  locations,
  fetchLocations,
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
    <RouteErrorBoundary>
    <Suspense fallback={<PageLoader />}>
    <Routes>
      {/* Home / List */}
      <Route path="/" element={
        <AnimalList 
          authToken={authToken}
          userProfile={userProfile}
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
          speciesOptions={speciesOptions}
          locations={locations}
          fetchLocations={fetchLocations}
        />
      } />
      
      {/* List Route (duplicate) */}
      <Route path="/list" element={
        <AnimalList 
          authToken={authToken}
          userProfile={userProfile}
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
          speciesOptions={speciesOptions}
          locations={locations}
          fetchLocations={fetchLocations}
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
            navigate(`/animal/${animalId}`);
          }}
          onViewProfile={(userId) => {
            navigate(`/user/${userId}`);
          }}
          onStartConversation={handleStartConversation}
        />
      } />

      {/* Profile */}
      <Route path="/settings/*" element={
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
          setAnimalBreedingLines={setAnimalBreedingLines} 
          saveBreedingLineDefs={saveBreedingLineDefs} 
          toggleAnimalBreedingLine={toggleAnimalBreedingLine} 
          BL_PRESETS_APP={BL_PRESETS_APP} 
        />
      } />

      {/* Contacts */}
      <Route path="/contacts" element={
        <ContactsListPage
          API_BASE_URL={API_BASE_URL}
          authToken={authToken}
          showModalMessage={showModalMessage}
        />
      } />
      <Route path="/contacts/:contactId" element={
        <ContactDetailPage
          API_BASE_URL={API_BASE_URL}
          authToken={authToken}
        />
      }>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<ContactOverview />} />
        <Route path="owned" element={<ContactOwnedAnimals />} />
        <Route path="bred" element={<ContactBredAnimals />} />
      </Route>
      <Route path="/contacts/new" element={
        <AddContactPage
          API_BASE_URL={API_BASE_URL}
          authToken={authToken}
          showModalMessage={showModalMessage}
          userProfile={userProfile}
        />
      } />
      <Route path="/contacts/:contactId/edit" element={
        <EditContactPage
          API_BASE_URL={API_BASE_URL}
          authToken={authToken}
          showModalMessage={showModalMessage}
          userProfile={userProfile}
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

      {/* Litters */}
      <Route path="/litters" element={
        <LitterManagement
          key="litters-route"
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

      {/* Calendar — standalone calendar page */}
      <Route path="/calendar" element={
        <CalendarPage
          authToken={authToken}
          API_BASE_URL={API_BASE_URL}
          userProfile={userProfile}
          showModalMessage={showModalMessage}
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

      {/* Supplies */}
      <Route path="/supplies" element={
        <SuppliesPage
          authToken={authToken}
          API_BASE_URL={API_BASE_URL}
          showModalMessage={showModalMessage}
        />
      } />

      {/* Genetics Calculator */}
      <Route path="/calculator" element={
        <GeneticsCalculator
          API_BASE_URL={API_BASE_URL}
          authToken={authToken}
          myAnimals={myAnimalsForCalculator}
          userRole={userProfile?.role}
        />
      } />

      {/* COI Calculator */}
      <Route path="/coi" element={
        <COICalculatorPage
          API_BASE_URL={API_BASE_URL}
          authToken={authToken}
          myAnimals={myAnimalsForCalculator}
          userProfile={userProfile}
        />
      } />

      {/* Target Outcome Calculator */}
      <Route path="/target" element={
        <TargetOutcomePage
          API_BASE_URL={API_BASE_URL}
          authToken={authToken}
          myAnimals={myAnimalsForCalculator}
          userProfile={userProfile}
          // Pass species data for trait selection
          speciesOptions={speciesOptions || []}
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

      {/* Tutorials Page */}
      <Route path="/tutorials" element={<TutorialsPage />} />

      {/* Family Tree Page */}
      <Route path="/pedigree" element={
        <FamilyTreePage
          API_BASE_URL={API_BASE_URL}
          authToken={authToken}
          myAnimals={myAnimalsForCalculator}
          userProfile={userProfile}
          onViewAnimal={handleViewAnimal}
        />
      } />

      {/* Report Page */}
      <Route path="/report" element={
        <ReportPage
          authToken={authToken}
          userProfile={userProfile}
          showModalMessage={showModalMessage}
        />
      } />

      {/* Resources Page — public, unauthenticated route */}
      <Route path="/resources" element={<ResourcesPage API_BASE_URL={API_BASE_URL} authToken={authToken} />} />

    </Routes>
    </Suspense>
    </RouteErrorBoundary>
  );
}

export default AppRoutes;
