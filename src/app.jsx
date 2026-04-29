// CritterTrack Frontend Application
import React, { useState, useEffect, useCallback, useRef, useMemo, useImperativeHandle } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams, Routes, Route, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Cat, UserPlus, LogIn, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Trash2, Edit, Save, PlusCircle, Plus, ArrowLeft, Loader2, RefreshCw, User, Users, ClipboardList, BookOpen, Settings, Mail, Globe, Bean, Milk, Search, X, Mars, Venus, Eye, EyeOff, Heart, HeartOff, HeartHandshake, Bell, XCircle, CheckCircle, Download, Upload, FileText, Link, Unlink, AlertCircle, DollarSign, Archive, ArrowLeftRight, RotateCcw, Info, Hourglass, MessageSquare, Ban, Flag, Scissors, VenusAndMars, Circle, Shield, Lock, AlertTriangle, ShoppingBag, Check, Star, Moon, MoonStar, Calculator, Network, TableOfContents, LayoutGrid, Home, Utensils, Wrench, Activity, ScrollText, Package, Calendar, Sparkles, QrCode, Images, Share2, Hash, Dna, TreeDeciduous, Tag, Egg, Hospital, Brain, Trophy, Scale, FileCheck, Palette, Sprout, Ruler, FolderOpen, Leaf, Microscope, Pill, Stethoscope, UtensilsCrossed, Droplets, Thermometer, Feather, Medal, Target, Key, Dumbbell, Gem, Flame, Baby, PawPrint, ArrowRight, LockOpen, Camera, BarChart2, Bird, Fish, Bug, Worm, Turtle, SlidersHorizontal } from 'lucide-react';
import ArchiveScreen from './components/ArchiveScreen';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import 'flag-icons/css/flag-icons.min.css';
import { formatDate, formatDateShort, formatDateDisplay, litterAge, formatTimeAgo } from './utils/dateFormatter';
import { GENDER_OPTIONS, STATUS_OPTIONS, DEFAULT_SPECIES_OPTIONS } from './utils/constants';
import { getSpeciesDisplayName, getSpeciesLatinName } from './utils/speciesUtils';
import { getCountryFlag, getCountryName, US_STATES, getStateName, getCurrencySymbol } from './utils/locationUtils';
import { getDonationBadge, DonationBadge } from './utils/donationUtils';
import { getActionLabel, getActionColor } from './utils/activityUtils';
import GeneticsCalculator from './components/GeneticsCalculator';
import GeneticCodeBuilder from './components/GeneticCodeBuilder';
import BudgetingTab from './components/BudgetingTab';
import TermsOfService from './components/TermsOfService';
import PrivacyPolicy from './components/PrivacyPolicy';
import InstallPWA from './components/InstallPWA';
import AdminPanel from './components/EnhancedAdminPanel';
import MaintenanceMode from './MaintenanceMode';
import { TUTORIAL_LESSONS } from './data/tutorialLessonsNew';
import DatePicker from './components/DatePicker';
import InfoTab from './components/InfoTab';
import WelcomeGuideModal from './components/WelcomeGuideModal';
import ReportButton from './components/ReportButton';
import ModerationAuthModal from './components/moderation/ModerationAuthModal';
import ModOversightPanel from './components/moderation/ModOversightPanel';
import ModeratorActionSidebar from './components/moderation/ModeratorActionSidebar';
import Marketplace from './components/Marketplace';
import AnimalTree from './components/AnimalTree';
import LitterManagement from './components/LitterManagement';
import AnimalForm, { PedigreeChart } from './components/AnimalForm';
import AnimalList from './components/AnimalList';
import AuthView from './components/Auth/AuthView';
import { WarningBanner, InformBanner, BroadcastPoll, UrgencyAlertsBanner, MgmtUrgencyBanner, BroadcastBanner, UrgentBroadcastPopup } from './components/Notifications/Banners';
import NotificationsHub from './components/Notifications/NotificationsHub';
import NotificationPanel from './components/Notifications/NotificationPanel';
import GlobalSearchBar from './components/PublicProfile/GlobalSearchBar';
import PublicProfileView, { QRModal } from './components/PublicProfile/PublicProfileView';
import BreederDirectory, { BreederDirectorySettings } from './components/PublicProfile/BreederDirectory';
import ProfileEditForm from './components/Profile/ProfileEditForm';
import ProfileView from './components/Profile/ProfileView';
import UserProfileCard from './components/Profile/UserProfileCard';
import ModalMessage from './components/shared/ModalMessage';
import CustomAppLogo from './components/shared/CustomAppLogo';
import LoadingSpinner from './components/shared/LoadingSpinner';
import AnimalImage from './components/shared/AnimalImage';
import AnimalImageUpload from './components/AnimalImageUpload';
import { compressImageFile, compressImageToMaxSize, compressImageWithWorker } from './utils/imageCompression';
import DonationView from './components/Donation/DonationView';
import CommunityPage from './components/Community/CommunityPage';

import PrivateAnimalDetail from './components/AnimalDetail/PrivateAnimalDetail';
import ViewOnlyPrivateAnimalDetail from './components/AnimalDetail/ViewOnlyPrivateAnimalDetail';
import ViewOnlyAnimalDetail from './components/AnimalDetail/ViewOnlyAnimalDetail';
import { OffspringSection } from './components/AnimalDetail/utils';

// Phase 7: Modals & Messages
import { ConflictResolutionModal, LitterSyncConflictModal } from './components/Modals/LitterConflictModals';
import { ParentSearchModal, LocalAnimalSearchModal, UserSearchModal } from './components/Modals/SearchModals';
import { SpeciesPickerModal, SpeciesManager, SpeciesSelector } from './components/Modals/SpeciesModals';
import { CommunityGeneticsModal } from './components/Modals/CommunityGeneticsModal';
import { MessagesView } from './components/Messages/MessagesView';

// Phase 10: Custom Hooks for App state decomposition
import { useAppAuth } from './hooks/useAppAuth.ts';
import { useIdleTimeout } from './hooks/useIdleTimeout.ts';
import { useAppModals } from './hooks/useAppModals.ts';
import { usePublicAnimalNavigation } from './hooks/usePublicAnimalNavigation.ts';
import { usePrivateAnimalNavigation } from './hooks/usePrivateAnimalNavigation.ts';
import { useTransferWorkflow } from './hooks/useTransferWorkflow.ts';
import { useBreedingLines } from './hooks/useBreedingLines.ts';
import { useModerationMode } from './hooks/useModerationMode.ts';
import { AppRoutes } from './AppRoutes';
import { PublicAnimalPage, PublicProfilePage } from './PublicPages';

// const API_BASE_URL = 'http://localhost:5000/api'; // Local development
// const API_BASE_URL = 'https://crittertrack-pedigree-production.up.railway.app/api'; // Direct Railway (for testing)
const API_BASE_URL = '/api'; // Production via Vercel proxy - v2

// App version for cache invalidation - increment to force cache clear
const APP_VERSION = '7.0.6';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

// ==================== PARENT CARD COMPONENT ====================
const ParentCard = ({ parentId, parentType, authToken, API_BASE_URL, onViewAnimal }) => {
    const [parentData, setParentData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [notFound, setNotFound] = React.useState(false);

    React.useEffect(() => {
        if (!parentId) {
            setParentData(null);
            setNotFound(false);
            return;
        }

        const fetchParent = async () => {
            setLoading(true);
            setNotFound(false);
            try {
                // Try to fetch from authenticated endpoint (can access any animal globally)
                try {
                    const response = await axios.get(`${API_BASE_URL}/animals/any/${parentId}`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    if (response.data) {
                        setParentData(response.data);
                        setLoading(false);
                        return;
                    }
                } catch (authError) {
                    // If authenticated endpoint fails, try public
                }

                // Try fetching from global public animals database
                const publicResponse = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${parentId}`);
                if (publicResponse.data && publicResponse.data.length > 0) {
                    setParentData(publicResponse.data[0]);
                } else {
                    // Animal not found in either collection - treat as if no parent recorded
                    console.warn(`[ParentCard] Parent ${parentId} not found in local or public collections`);
                    setNotFound(true);
                    setParentData(null);
                }
            } catch (error) {
                console.error(`[ParentCard] Error fetching ${parentType}:`, error);
                setNotFound(true);
                setParentData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchParent();
    }, [parentId, parentType, authToken, API_BASE_URL]);

    if (!parentId || notFound) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">No {parentType} recorded</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="border-2 border-gray-300 rounded-lg p-4 flex justify-center items-center">
                <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (!parentData) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">Loading {parentType} data...</p>
            </div>
        );
    }

    const imgSrc = parentData.imageUrl || parentData.photoUrl || null;

    return (
        <div 
            className="border-2 border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onViewAnimal(parentData)}
        >
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
                <p className="text-xs font-semibold text-gray-600">{parentType}</p>
            </div>
            <div className="p-3 flex flex-col items-center">
                {/* Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center mb-2">
                    {imgSrc ? (
                        <img src={imgSrc} alt={parentData.name} className="w-full h-full object-cover" />
                    ) : (
                        <Cat size={28} className="text-gray-400" />
                    )}
                </div>

                {/* Icon row */}
                <div className="flex justify-center items-center space-x-2 mb-2">
                    {parentData.isOwned ? (
                        <Heart size={12} className="text-black" />
                    ) : (
                        <HeartOff size={12} className="text-black" />
                    )}
                    {parentData.showOnPublicProfile ? (
                        <Eye size={12} className="text-black" />
                    ) : (
                        <EyeOff size={12} className="text-black" />
                    )}
                    {parentData.isInMating && <Hourglass size={12} className="text-black" />}
                    {parentData.isPregnant && <Bean size={12} className="text-black" />}
                    {parentData.isNursing && <Milk size={12} className="text-black" />}
                </div>

                {/* Name */}
                <div className="text-center mb-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                        {parentData.prefix ? `${parentData.prefix} ` : ''}{parentData.name}{parentData.suffix ? ` ${parentData.suffix}` : ''}
                    </p>
                </div>

                {/* ID */}
                <div className="text-center mb-2">
                    <p className="text-xs text-gray-500">{parentData.id_public}</p>
                </div>

                {/* Status bar */}
                <div className="w-full bg-gray-100 py-1 text-center border-t border-gray-300">
                    <p className="text-xs font-medium text-gray-700">{parentData.status || 'Unknown'}</p>
                </div>
            </div>
        </div>
    );
};

// ==================== APP COMPONENT ====================
const App = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Phase 10: Initialize custom hooks for state management
    // Phase 10b: Modal state management
    const modals = useAppModals();
    
    // Phase 10a: Auth & Idle Timeout (will be called later after showModalMessage defined)
    const [authTokenTemp, setAuthTokenTemp] = useState(null);
    const [userProfileTemp, setUserProfileTemp] = useState(null);
    
    // Phase 10c: Animal Navigation
    const publicAnimalNav = usePublicAnimalNavigation();
    const privateAnimalNav = usePrivateAnimalNavigation(authTokenTemp, API_BASE_URL);
    
    // Phase 10d: Transfer Workflow
    const transferWorkflow = useTransferWorkflow(authTokenTemp, API_BASE_URL, (title, message) => {
        setModalMessage({ title, message });
        setShowModal(true);
    });
    
    // Phase 10e: Breeding Lines
    const breedingLinesState = useBreedingLines(authTokenTemp, API_BASE_URL);
    
    // Temporarily store auth for hook setup
    const [modalMessage, setModalMessage] = useState({ title: '', message: '' });
    const [showModal, setShowModal] = useState(false);
    
    // Define showModalMessage function for hooks
    const showModalMessage = useCallback((title, message) => {
        setModalMessage({ title, message });
        setShowModal(true);
    }, []);
    
    // Phase 10f: Moderation Mode
    const modMode = useModerationMode(authTokenTemp, API_BASE_URL, userProfileTemp, showModalMessage);
    
    // Now initialize auth hook with showModalMessage callback
    const {
        authToken: authTokenAuth,
        setAuthToken: setAuthTokenAuth,
        userProfile: userProfileAuth,
        setUserProfile: setUserProfileAuth,
        fetchUserProfile: fetchUserProfileAuth
    } = useAppAuth(API_BASE_URL, showModalMessage);
    
    // Sync auth from useAppAuth hook into temp storage
    useEffect(() => {
        setAuthTokenTemp(authTokenAuth);
        setUserProfileTemp(userProfileAuth);
    }, [authTokenAuth, userProfileAuth]);
    
    // Use auth values from hook
    const authToken = authTokenAuth;
    const setAuthToken = setAuthTokenAuth;
    const userProfile = userProfileAuth;
    const setUserProfile = setUserProfileAuth;
    const fetchUserProfile = fetchUserProfileAuth;
    
    // Setup idle timeout with auth
    useIdleTimeout(authToken, () => handleLogout(), (title, message) => {
        setModalMessage({ title, message });
        setShowModal(true);
    });
    
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [userCount, setUserCount] = useState('...');
    
    // Derive currentView from URL path
    const currentView = location.pathname.split('/')[1] || 'list';
    
    // Map hook states to legacy variable names for backward compatibility
    const { viewingPublicAnimal, setViewingPublicAnimal, publicAnimalViewHistory, setPublicAnimalViewHistory, publicAnimalInitialTab, setPublicAnimalInitialTab, handleViewPublicAnimal, handleBackFromPublicAnimal, handleCloseAllPublicAnimals } = publicAnimalNav;
    const { animalToView, setAnimalToView, animalToEdit, setAnimalToEdit, animalViewHistory, privateAnimalInitialTab, setPrivateAnimalInitialTab, privateBetaView, setPrivateBetaView, speciesToAdd, setSpeciesToAdd, editReturnPathRef, viewReturnPathRef, handleViewAnimal, handleEditAnimal, handleCancelEditAnimal, handleBackFromAnimal, handleCloseAllAnimals, handleSaveAnimal, handleArchiveAnimal, handleDeleteAnimal, toggleAnimalOwned, handleRestoreViewOnlyAnimal } = privateAnimalNav;
    const { showTransferModal, setShowTransferModal, budgetModalOpen, setBudgetModalOpen, transferAnimal, setTransferAnimal, preSelectedTransferAnimal, preSelectedTransactionType, setPreSelectedTransferAnimal, setPreSelectedTransactionType, transferUserQuery, setTransferUserQuery, transferUserResults, setTransferUserResults, transferSelectedUser, setTransferSelectedUser, transferSearching, setTransferSearching, transferSearchPerformed, setTransferSearchPerformed, transferPrice, setTransferPrice, transferNotes, setTransferNotes, handleSearchTransferUser, handleSelectTransferUser, handleSubmitTransfer, handleCloseTransferWorkflow } = transferWorkflow;
    const { breedingLineDefs, setBreedingLineDefs, animalBreedingLines, setAnimalBreedingLines, BL_PRESETS_APP, saveBreedingLineDefs, toggleAnimalBreedingLine, setAnimalBreedingLinesDirect } = breedingLinesState;
    const { inModeratorMode, setInModeratorMode, showAdminPanel, setShowAdminPanel, showModReportQueue, setShowModReportQueue, showModerationAuthModal, setShowModerationAuthModal, modCurrentContext, setModCurrentContext, handleToggleModerationMode, handleModerationAuth, handleModQuickFlag } = modMode;
    const { setAnimalViewHistory } = privateAnimalNav;

    // Local state not covered by hooks
    const [detailViewTab, setDetailViewTab] = useState(1);
    const [viewAnimalBreederInfo, setViewAnimalBreederInfo] = useState(null);
    const [speciesOptions, setSpeciesOptions] = useState([]);
    const [speciesConfigs, setSpeciesConfigs] = useState({});
    const [speciesSearchTerm, setSpeciesSearchTerm] = useState('');
    const [speciesCategoryFilter, setSpeciesCategoryFilter] = useState('All');
    
    // Detect mobile/app environment
    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Version check - clear localStorage cache if version changed
    React.useEffect(() => {
        const storedVersion = localStorage.getItem('appVersion');
        if (storedVersion !== APP_VERSION) {
            // Clear all filter-related localStorage items
            const filterKeys = [
                'animalList_statusFilter',
                'animalList_searchInput',
                'animalList_appliedNameFilter',
                'animalList_selectedGenders',
                'animalList_selectedSpecies',
                'animalList_statusFilterPregnant',
                'animalList_statusFilterNursing',
                'animalList_statusFilterMating',
                'animalList_showOwned',
                'animalList_showUnowned',
                'animalList_ownedFilterActive',
                'animalList_publicFilter'
            ];
            
            filterKeys.forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Update stored version
            localStorage.setItem('appVersion', APP_VERSION);
        }
    }, []);
    
    // Sync species favorites between localStorage and backend
    useEffect(() => {
        const syncSpeciesFavorites = async () => {
            if (!authToken) return;
            
            try {
                // Get current localStorage favorites
                const localFavorites = JSON.parse(localStorage.getItem('speciesFavorites') || '[]');
                
                // Fetch from backend
                const response = await axios.get(`${API_BASE_URL}/users/species-favorites`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                
                const backendFavorites = response.data?.speciesFavorites || [];
                
                // Merge: union of both lists (take all unique favorites from both sources)
                const mergedFavorites = [...new Set([...localFavorites, ...backendFavorites])];
                
                // Only update if there's a difference
                if (JSON.stringify(mergedFavorites) !== JSON.stringify(backendFavorites)) {
                    // Save merged favorites to backend
                    await axios.post(`${API_BASE_URL}/users/species-favorites`, 
                        { speciesFavorites: mergedFavorites },
                        { headers: { Authorization: `Bearer ${authToken}` } }
                    );
                }
                
                // Update localStorage with merged favorites
                localStorage.setItem('speciesFavorites', JSON.stringify(mergedFavorites));
            } catch (error) {
                console.error('[SPECIES FAVORITES] Sync error:', error);
                // Silently fail - user can still use localStorage
            }
        };
        
        syncSpeciesFavorites();
    }, [authToken, API_BASE_URL]);

    // Listen for favorites changes to sync to backend
    useEffect(() => {
        if (!authToken) return;
        
        const syncToBackend = async (e) => {
            try {
                const favorites = e.detail; // from custom event
                await axios.post(`${API_BASE_URL}/users/species-favorites`, 
                    { speciesFavorites: favorites },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );
            } catch (error) {
                console.error('[SPECIES FAVORITES] Failed to sync to backend:', error);
            }
        };
        
        window.addEventListener('speciesFavoritesChanged', syncToBackend);
        return () => window.removeEventListener('speciesFavoritesChanged', syncToBackend);
    }, [authToken, API_BASE_URL]);
    
    // Fetch and display user count on login/register screen
    useEffect(() => {
        const fetchUserCount = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/public/users/count`);
                if (response.ok) {
                    const data = await response.json();
                    const count = data.totalUsers || 'many';
                    const formattedCount = typeof count === 'number' ? count.toLocaleString() : count;
                    setUserCount(formattedCount);
                }
            } catch (err) {
                console.error('Failed to fetch user count:', err);
                // Keep the "..." placeholder if fetch fails
            }
        };
        fetchUserCount();
    }, [API_BASE_URL, setUserCount]);
    
    // Tutorial context hook
 
    // NOTE: animalToEdit, speciesToAdd, etc. are now handled by custom hooks (usePrivateAnimalNavigation, etc.)
    // Removed from here to avoid conflicts with hook state
    const [isRegister, setIsRegister] = useState(false); 
    
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    
    const [showMessages, setShowMessages] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [unreadAdminMessageCount, setUnreadAdminMessageCount] = useState(0);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    const [showUserSearchModal, setShowUserSearchModal] = useState(false);
    const [viewingPublicProfile, setViewingPublicProfile] = useState(null);
    // NOTE: viewingPublicAnimal, publicAnimalViewHistory now handled by usePublicAnimalNavigation hook
    // NOTE: animalToView, animalToEdit, animalViewHistory now handled by usePrivateAnimalNavigation hook
    // NOTE: breedingLineDefs, animalBreedingLines now handled by useBreedingLines hook
    // All breeding line logic consolidated into custom hook for reusability--------------------------------------------------------
    const [parentCardKey, setParentCardKey] = useState(0); // Force parent cards to refetch when tab opens
    const [animalDataRefreshTrigger, setAnimalDataRefreshTrigger] = useState(0); // Force entire animal data refresh after ANY edit
    const [showTabs, setShowTabs] = useState(true); // Toggle for collapsible tabs panel
    const [sireData, setSireData] = useState(null);
    const [damData, setDamData] = useState(null);
    const [offspringData, setOffspringData] = useState([]);
    
    // Wrapper around handleSaveAnimal to trigger data refresh on any save
    const handleSaveAnimalWithRefresh = async (...args) => {
        await handleSaveAnimal(...args);
        // Trigger full refresh of animal data after save
        setAnimalDataRefreshTrigger(t => t + 1);
    };

    // Add Sibling: open blank form pre-filled with same species/birthdate/parents
    const [siblingTemplate, setSiblingTemplate] = React.useState(null);
    const handleAddSibling = React.useCallback((sourceAnimal) => {
        if (!sourceAnimal) return;
        const birthDate = sourceAnimal.birthDate
            ? new Date(sourceAnimal.birthDate).toISOString().substring(0, 10)
            : '';
        setSiblingTemplate({
            species: sourceAnimal.species,
            birthDate,
            fatherId_public: sourceAnimal.fatherId_public || sourceAnimal.sireId_public || null,
            motherId_public: sourceAnimal.motherId_public || sourceAnimal.damId_public || null,
        });
        setAnimalToView(null);
    }, [setAnimalToView]);

    // Immediately apply a partial/full animal update to animalToView and broadcast to all listeners
    const handleAnimalFieldUpdate = React.useCallback((updatedAnimal) => {
        if (!updatedAnimal?.id_public) return;
        setAnimalToView(prev => prev ? { ...prev, ...updatedAnimal } : updatedAnimal);
        window.dispatchEvent(new CustomEvent('animal-updated', { detail: updatedAnimal }));
    }, []);

    // Toggle owned status with optimistic update + API sync
    const handleToggleAnimalOwned = React.useCallback(async (animalId, newOwnedValue) => {
        // Optimistic update
        const patch = { id_public: animalId, isOwned: newOwnedValue };
        setAnimalToView(prev => prev?.id_public === animalId ? { ...prev, isOwned: newOwnedValue } : prev);
        window.dispatchEvent(new CustomEvent('animal-updated', { detail: patch }));
        // Persist
        try {
            await axios.put(`${API_BASE_URL}/animals/${animalId}`, { isOwned: newOwnedValue }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
        } catch (err) {
            // Revert
            const revert = { id_public: animalId, isOwned: !newOwnedValue };
            setAnimalToView(prev => prev?.id_public === animalId ? { ...prev, isOwned: !newOwnedValue } : prev);
            window.dispatchEvent(new CustomEvent('animal-updated', { detail: revert }));
            console.error('Failed to update owned status:', err);
        }
    }, [API_BASE_URL, authToken]);
    
    // Clear history when animal view is completely closed
    React.useEffect(() => {
        if (!animalToView) {
            setAnimalViewHistory([]);
        }
    }, [animalToView]);
    
    // Clear history when public animal view is completely closed
    React.useEffect(() => {
        if (!viewingPublicAnimal) {
            setPublicAnimalViewHistory([]);
        }
    }, [viewingPublicAnimal]);
    
    // Force parent cards to refetch when Lineage tab opens
    React.useEffect(() => {
        if (detailViewTab === 5) {
            setParentCardKey(k => k + 1);
        }
    }, [detailViewTab]);
    
    // Fetch parent animals when viewing an animal
    React.useEffect(() => {
        if (!animalToView) {
            setSireData(null);
            setDamData(null);
            setOffspringData([]);
            return;
        }
        
        const fetchPedigreeData = async () => {
            try {
                const sireId = animalToView.sireId_public || animalToView.fatherId_public;
                const damId = animalToView.damId_public || animalToView.motherId_public;
                
                // Fetch parents using /any/ endpoint to get parents regardless of ownership
                if (sireId) {
                    const response = await axios.get(`${API_BASE_URL}/animals/any/${sireId}`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    setSireData(response.data);
                }
                
                if (damId) {
                    const response = await axios.get(`${API_BASE_URL}/animals/any/${damId}`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    setDamData(response.data);
                }
                
                // Fetch offspring using the dedicated offspring endpoint
                try {
                    const offspringResponse = await axios.get(`${API_BASE_URL}/animals/${animalToView.id_public}/offspring`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    
                    const litters = offspringResponse.data || [];
                    // Flatten offspring from all litters into a single array
                    const allOffspring = [];
                    litters.forEach(litter => {
                        if (litter.offspring && Array.isArray(litter.offspring)) {
                            allOffspring.push(...litter.offspring);
                        }
                    });
                    
                    setOffspringData(allOffspring);
                } catch (e) {
                    setOffspringData([]);
                }
            } catch (error) {
                console.error('Error fetching pedigree data:', error);
            }
        };
        
        fetchPedigreeData();
    }, [animalToView, authToken, animalDataRefreshTrigger]);
    
    // Re-fetch the current animal from server when data is saved/updated
    React.useEffect(() => {
        if (!animalToView?.id_public || animalDataRefreshTrigger === 0 || !authToken) return;
        
        const refetchCurrentAnimal = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/animals/${animalToView.id_public}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                // Update the animal state with fresh data from server
                setAnimalToView(response.data);
                // Broadcast settled server state to all components
                window.dispatchEvent(new CustomEvent('animal-updated', { detail: response.data }));
            } catch (error) {
                console.error('Error refetching animal data:', error);
            }
        };
        
        refetchCurrentAnimal();
    }, [animalDataRefreshTrigger, animalToView?.id_public, authToken, API_BASE_URL]);

    // Global: keep animalToView in sync with any animal-updated event from anywhere in the app
    React.useEffect(() => {
        const handleGlobalAnimalUpdate = (e) => {
            const updated = e.detail;
            if (!updated?.id_public) return;
            setAnimalToView(prev => {
                if (!prev || prev.id_public !== updated.id_public) return prev;
                return { ...prev, ...updated };
            });
        };
        window.addEventListener('animal-updated', handleGlobalAnimalUpdate);
        return () => window.removeEventListener('animal-updated', handleGlobalAnimalUpdate);
    }, []);
    
    const [showPedigreeChart, setShowPedigreeChart] = useState(false);
    const [copySuccessAnimal, setCopySuccessAnimal] = useState(false);
    const [showQRAnimal, setShowQRAnimal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);
    const handleImageDownload = async (imageUrl) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `crittertrack-image-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Failed to download image:', error);
        }
    };
    const [breedingRecordLitters, setBreedingRecordLitters] = useState({});
    const [expandedBreedingRecords, setExpandedBreedingRecords] = useState({});
    const [showCreateLitterModal, setShowCreateLitterModal] = useState(false);
    const [showLinkLitterModal, setShowLinkLitterModal] = useState(false);
    const [breedingRecordForLitter, setBreedingRecordForLitter] = useState(null);

    // Fetch litter data when breeding records expand (for male/female counts and COI)
    React.useEffect(() => {
        if (!animalToView?.breedingRecords?.length || !authToken) return;
        Object.entries(expandedBreedingRecords).forEach(([idxStr, isExpanded]) => {
            if (!isExpanded) return;
            const idx = parseInt(idxStr);
            const record = animalToView.breedingRecords[idx];
            if (!record?.litterId || breedingRecordLitters[record.litterId] !== undefined) return;
            axios.get(`${API_BASE_URL}/litters`, { headers: { Authorization: `Bearer ${authToken}` } })
                .then(res => {
                    const litter = res.data.find(l => l.litter_id_public === record.litterId);
                    if (litter) setBreedingRecordLitters(prev => ({ ...prev, [record.litterId]: litter }));
                })
                .catch(() => {});
        });
    }, [expandedBreedingRecords, animalToView?.breedingRecords, authToken, API_BASE_URL]);
    
    const [showBugReportModal, setShowBugReportModal] = useState(false);
    const [bugReportCategory, setBugReportCategory] = useState('Bug');
    const [bugReportDescription, setBugReportDescription] = useState('');
    const [bugReportSubmitting, setBugReportSubmitting] = useState(false);
    
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackSpecies, setFeedbackSpecies] = useState('');
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    
    const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
    const [hasSeenWelcomeGuide, setHasSeenWelcomeGuide] = useState(false);
    
    const [hasSeenDonationHighlight, setHasSeenDonationHighlight] = useState(() => {
        return localStorage.getItem('hasSeenDonationHighlight') === 'true';
    });
    
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    
    // Animals for genetics calculator
    const [myAnimalsForCalculator, setMyAnimalsForCalculator] = useState([]);
    
    // Cached litters to prevent re-fetching on navigation
    const [cachedLitters, setCachedLitters] = useState(null);
    const [litterCacheTimestamp, setLitterCacheTimestamp] = useState(0);
    
    // Available animals showcase (mixed: for sale + for stud)
    const [availableAnimals, setAvailableAnimals] = useState([]);
    const [currentAvailableIndex, setCurrentAvailableIndex] = useState(0);
    
    // NOTE: Transfer modal states now handled by useTransferWorkflow hook
    // (showTransferModal, transferAnimal, preSelectedTransferAnimal, etc.)
    
    // Archive states
    const [showArchiveScreen, setShowArchiveScreen] = useState(false);
    const [archivedAnimals, setArchivedAnimals] = useState([]);
    const [soldTransferredAnimals, setSoldTransferredAnimals] = useState([]);
    const [archiveLoading, setArchiveLoading] = useState(false);
    
    // Tutorial modal states
    const [showInfoTab, setShowInfoTab] = useState(false);
    // NOTE: showAdminPanel, inModeratorMode, showModReportQueue now handled by useModerationMode hook
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuDesktopRef = useRef(null);
    const profileMenuMobileRef = useRef(null);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');
    const [showUrgentNotification, setShowUrgentNotification] = useState(false);
    const [urgentNotificationData, setUrgentNotificationData] = useState({ title: '', content: '' });

    const consecutiveAuthErrors = useRef(0);

    const handleLogout = useCallback((expired = false) => {
        setAuthToken(null);
        setUserProfile(null);
        setInModeratorMode(false);
        setShowAdminPanel(false);
        setShowModReportQueue(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('moderationAuthenticated');
        localStorage.removeItem('ct_bldefs');
        localStorage.removeItem('ct_blassign');
        setBreedingLineDefs(Array.from({ length: 10 }, (_, i) => ({ id: i, name: '', color: BL_PRESETS_APP[i] })));
        setAnimalBreedingLines({});
        navigate('/');
        if (expired) {
            showModalMessage('Session Expired', 'You were logged out due to 30 minutes of inactivity.');
        }
    }, [showModalMessage]);

    // Phase 10a: Use idle timeout hook
    useIdleTimeout(authToken, handleLogout, showModalMessage);

    // NOTE: handleModQuickFlag now provided by useModerationMode hook (Phase 10f)
    // Old implementation removed to avoid conflicts - see useModerationMode.ts for current version

    // Detect mobile/app environment
    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Poll for maintenance mode and urgent notifications
    useEffect(() => {
        // Skip maintenance check for admins/moderators - they should always have access
        const isStaff = ['admin', 'moderator'].includes(userProfile?.role);
        if (!authToken || isStaff) {
            return; // Don't need to check if staff or not logged in
        }

        // Capture current values in refs so interval callback doesn't re-trigger effect
        let currentMaintenanceMode = false;

        const pollForUpdates = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/admin/maintenance-status`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const data = response.data;
                
                if (data.active && !currentMaintenanceMode) {
                    // Maintenance mode just activated
                    currentMaintenanceMode = true;
                    setMaintenanceMode(true);
                    setMaintenanceMessage(data.message || 'System Maintenance in Progress');
                    
                    // Show urgent notification to user about maintenance
                    setUrgentNotificationData({
                        title: 'SYSTEM MAINTENANCE ACTIVATED',
                        content: data.message || 'The system is going into maintenance mode. You will be logged out shortly.'
                    });
                    setShowUrgentNotification(true);
                    
                    // Logout user after 5 seconds
                    setTimeout(() => {
                        handleLogout();
                    }, 5000);
                } else if (!data.active && currentMaintenanceMode) {
                    // Maintenance mode just deactivated
                    currentMaintenanceMode = false;
                    setMaintenanceMode(false);
                    setMaintenanceMessage('');
                    showModalMessage('Notice', 'Maintenance mode has been deactivated. System is back online.');
                }
            } catch (error) {
                console.error('Error checking maintenance status:', error);
            }
        };

        const pollInterval = setInterval(pollForUpdates, 300000); // Check every 5 minutes
        pollForUpdates(); // Check immediately on mount

        return () => clearInterval(pollInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authToken, API_BASE_URL]);

    // Listen for urgent notifications via WebSocket or server-sent events
    useEffect(() => {
        if (!authToken) {
            return;
        }

        // TODO: Implement urgent notifications when backend EventSource endpoint is available
        // EventSource doesn't support custom headers, so auth needs to be handled via query params
        // For now, urgent notifications are disabled to prevent 401 errors
        
        return () => {
            // Cleanup if needed
        };
    }, [authToken, userProfile, maintenanceMode, API_BASE_URL, showModalMessage, handleLogout]);

    // Poll for user account status changes (suspension/ban)
    useEffect(() => {
        if (!authToken) {
            return;
        }

        const pollUserStatus = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/auth/status`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                consecutiveAuthErrors.current = 0; // reset on successful response
                const data = response.data;
                
                // Check if suspension was recently lifted (within 24 hours)
                if (data.suspensionLifted) {
                    const savedNotification = localStorage.getItem('suspensionLiftedNotification');
                    if (!savedNotification) {
                        console.log('[AUTH] Suspension has been lifted for user');
                        // Clear the suspension info from localStorage
                        localStorage.removeItem('suspensionEndTime');
                        localStorage.removeItem('suspensionReason');
                        // Store notification with 24-hour expiry
                        const expiresAt = new Date().getTime() + (24 * 60 * 60 * 1000);
                        localStorage.setItem('suspensionLiftedNotification', JSON.stringify({ expiresAt }));
                        // Force a page reload to update the UI
                        window.location.reload();
                    }
                }
                
                // Check if user status has changed to suspended or banned
                if (data.accountStatus === 'suspended' || data.accountStatus === 'banned') {
                    console.log('[AUTH] User account status changed:', data.accountStatus);
                    
                    // Logout user and show message
                    handleLogout();
                    
                    const title = data.accountStatus === 'suspended' ? 'Account Suspended' : 'Account Banned';
                    const message = data.accountStatus === 'suspended' 
                        ? (data.suspensionReason || 'Your account has been suspended.')
                        : (data.banReason || 'Your account has been banned.');
                    
                    showModalMessage(title, message);
                }
            } catch (error) {
                // If we get a 403 with forceLogout flag, handle it immediately
                if (error.response?.status === 403 && error.response?.data?.forceLogout) {
                    consecutiveAuthErrors.current = 0;
                    const accountStatus = error.response?.data?.accountStatus;
                    const message = error.response?.data?.message || 'Your account status has changed.';
                    
                    console.log('[AUTH] Force logout on status check:', { accountStatus, message });
                    handleLogout();
                    showModalMessage(
                        accountStatus === 'suspended' ? 'Account Suspended' : 'Account Status Changed',
                        message
                    );
                } else if (error.response?.status === 401) {
                    // Token may appear invalid transiently on network reconnection.
                    // Only logout after 3 consecutive 401s to avoid spurious sign-outs.
                    consecutiveAuthErrors.current += 1;
                    console.log(`[AUTH] Status check 401 (${consecutiveAuthErrors.current}/3)`);
                    if (consecutiveAuthErrors.current >= 3) {
                        console.log('[AUTH] Persistent 401 ? logging out');
                        consecutiveAuthErrors.current = 0;
                        handleLogout();
                    }
                } else {
                    // Network error or 5xx ? transient, reset counter and stay silent
                    consecutiveAuthErrors.current = 0;
                }
                // Other errors are non-critical (network, server errors) - don't logout
            }
        };

        // Poll every 2 minutes for user status changes
        const statusPollInterval = setInterval(pollUserStatus, 120000);
        
        // Also check immediately on mount
        pollUserStatus();

        return () => clearInterval(statusPollInterval);
    }, [authToken, API_BASE_URL, handleLogout, showModalMessage]);

    // Note: Onboarding tutorial is no longer auto-triggered for new users
    // Instead, users see a one-time WelcomeGuideModal that explains profile setup
    // Tutorials are available manually via the Help button (?) in the header

    // Clear pre-selected transfer data when leaving budget view
    useEffect(() => {
        if (currentView !== 'budget') {
            setPreSelectedTransferAnimal(null);
            setPreSelectedTransactionType(null);
        }
    }, [currentView]);

    // Auth token effect - set up axios defaults
    useEffect(() => {
        if (authToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('authToken');
            setUserProfile(null);
            // Only redirect to home if not on a public route
            const publicRoutes = ['donation', 'genetics-calculator', 'breeder', 'animal'];
            const currentPath = location.pathname.split('/')[1] || '';
            if (!publicRoutes.includes(currentPath)) {
                navigate('/');
            }
        }
    }, [authToken, navigate, location.pathname]);

    // Handle ?message= query param to open messages with a specific user
    useEffect(() => {
        if (!authToken || !userProfile) return;
        
        const params = new URLSearchParams(window.location.search);
        const messageUserId = params.get('message');
        
        if (messageUserId) {
            // Clear the query param from URL
            window.history.replaceState({}, '', window.location.pathname);
            
            // Fetch the user's profile to get their name
            axios.get(`${API_BASE_URL}/public/profile/${messageUserId}`)
                .then(res => {
                    const targetProfile = res.data;
                    setSelectedConversation({
                        otherUserId: targetProfile.userId_backend || messageUserId,
                        otherUser: {
                            id_public: targetProfile.id_public || messageUserId,
                            personalName: targetProfile.personalName,
                            breederName: targetProfile.breederName,
                            showPersonalName: targetProfile.showPersonalName,
                            showBreederName: targetProfile.showBreederName,
                            profileImage: targetProfile.profileImage
                        }
                    });
                    setShowMessages(true);
                })
                .catch(err => {
                    console.error('Failed to load user for messaging:', err);
                    showModalMessage('Error', 'Could not start conversation with this user.');
                });
        }
    }, [authToken, userProfile, showModalMessage]);

    // Check if user has seen welcome guide ? backend flag is authoritative, localStorage is a fast-path cache
    useEffect(() => {
        if (!authToken || !userProfile) return;
        
        const storageKey = `${userProfile._id}_hasSeenWelcomeGuide`;

        // Backend flag (survives cache clears)
        if (userProfile.hasSeenProfileSetupGuide) {
            localStorage.setItem(storageKey, 'true'); // sync cache
            setHasSeenWelcomeGuide(true);
            return;
        }

        // Fall back to localStorage
        const hasSeen = localStorage.getItem(storageKey) === 'true';
        setHasSeenWelcomeGuide(hasSeen);
        
        // Show modal if they haven't seen it
        if (!hasSeen) {
            setShowWelcomeGuide(true);
        }
    }, [authToken, userProfile]);

    // Fetch animals for genetics calculator when needed
    useEffect(() => {
        const fetchAnimalsForCalculator = async () => {
            if (currentView === 'genetics-calculator' && authToken) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/animals?isOwned=true`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    setMyAnimalsForCalculator(response.data || []);

                } catch (error) {
                    console.error('Failed to fetch animals for calculator:', error);
                    setMyAnimalsForCalculator([]);
                }
            }
        };
        fetchAnimalsForCalculator();
    }, [currentView, authToken, API_BASE_URL]);


    // Fetch breeder info when viewing an animal
    useEffect(() => {
        const fetchViewBreederInfo = async () => {
            if (animalToView?.breederId_public && currentView === 'view-animal') {
                try {
                    const response = await axios.get(
                        `${API_BASE_URL}/public/profiles/search?query=${animalToView.breederId_public}&limit=1`
                    );
                    if (response.data && response.data.length > 0) {
                        setViewAnimalBreederInfo(response.data[0]);
                    }
                } catch (error) {
                    console.error('Failed to fetch breeder info for view:', error);
                    setViewAnimalBreederInfo(null);
                }
            } else {
                setViewAnimalBreederInfo(null);
            }
        };
        fetchViewBreederInfo();
    }, [animalToView, currentView, API_BASE_URL]);

    const fetchNotificationCount = useCallback(async () => {
        if (!authToken) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setNotificationCount(response.data?.count || 0);
        } catch (error) {
            console.error('Failed to fetch notification count:', error);
        }
    }, [authToken, API_BASE_URL]);

    const fetchUnreadMessageCount = useCallback(async () => {
        if (!authToken) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/messages/unread-count`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setUnreadMessageCount(response.data?.count || 0);
            setUnreadAdminMessageCount(response.data?.adminCount || 0);
        } catch (error) {
            // Silently fail for message count - backend may not have this endpoint yet
            if (error.response?.status !== 404 && error.response?.status !== 500) {
                console.error('Failed to fetch message count:', error);
            }
            setUnreadMessageCount(0);
            setUnreadAdminMessageCount(0);
        }
    }, [authToken, API_BASE_URL]);

    useEffect(() => {
        if (authToken) {
            fetchNotificationCount();
            fetchUnreadMessageCount();
            // Poll for new notifications and messages every 60 seconds
            const interval = setInterval(() => {
                fetchNotificationCount();
                fetchUnreadMessageCount();
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [authToken, fetchNotificationCount, fetchUnreadMessageCount]);

    // Mark donation highlight as seen after 8 seconds
    useEffect(() => {
        if (authToken && !hasSeenDonationHighlight) {
            const timer = setTimeout(() => {
                setHasSeenDonationHighlight(true);
                localStorage.setItem('hasSeenDonationHighlight', 'true');
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [authToken, hasSeenDonationHighlight]);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            const inDesktop = profileMenuDesktopRef.current?.contains(e.target);
            const inMobile = profileMenuMobileRef.current?.contains(e.target);
            if (!inDesktop && !inMobile) setShowProfileMenu(false);
        };
        if (showProfileMenu) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfileMenu]);
	
    // Fetch global species list and configs
    useEffect(() => {
        const fetchSpeciesAndConfigs = async () => {
            try {
                const [speciesResponse, configsResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/species`),
                    axios.get(`${API_BASE_URL}/species/configs`)
                ]);
                setSpeciesOptions(speciesResponse.data);
                setSpeciesConfigs(configsResponse.data || {});
            } catch (error) {
                console.error('Failed to fetch species:', error);
                // Fallback to defaults if API fails
                setSpeciesOptions([
                    { name: 'Fancy Mouse', category: 'Mammal', isDefault: true },
                    { name: 'Fancy Rat', category: 'Mammal', isDefault: true },
                    { name: 'Russian Dwarf Hamster', category: 'Mammal', isDefault: true },
                    { name: 'Campbells Dwarf Hamster', category: 'Mammal', isDefault: true },
                    { name: 'Chinese Dwarf Hamster', category: 'Mammal', isDefault: true },
                    { name: 'Syrian Hamster', category: 'Mammal', isDefault: true },
                    { name: 'Guinea Pig', category: 'Mammal', isDefault: true }
                ]);
                setSpeciesConfigs({});
            }
        };
        fetchSpeciesAndConfigs();
    }, [API_BASE_URL]);
	
    const handleBugReportSubmit = async (e) => {
        e.preventDefault();
        if (!bugReportDescription.trim()) {
            showModalMessage('Error', 'Please enter a description for your report.');
            return;
        }
        
        setBugReportSubmitting(true);
        try {
            await axios.post(`${API_BASE_URL}/bug-reports`, {
                category: bugReportCategory,
                description: bugReportDescription,
                page: currentView
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            showModalMessage('Success', 'Thank you for your report! We will review it soon.');
            setShowBugReportModal(false);
            setBugReportDescription('');
            setBugReportCategory('Bug');
        } catch (error) {
            console.error('Failed to submit bug report:', error);
            showModalMessage('Error', 'Failed to submit report. Please try again.');
        } finally {
            setBugReportSubmitting(false);
        }
    };
    
    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (!feedbackSpecies || !feedbackText.trim()) return;
        
        setFeedbackSubmitting(true);
        try {
            await axios.post(
                `${API_BASE_URL}/feedback/species`,
                {
                    species: feedbackSpecies,
                    feedback: feedbackText.trim(),
                    type: 'species-customization'
                },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            showModalMessage('Feedback Sent', 'Thank you! Your feedback will help us improve species customization.');
            setShowFeedbackModal(false);
            setFeedbackSpecies('');
            setFeedbackText('');
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            showModalMessage('Error', 'Failed to submit feedback. Please try again.');
        } finally {
            setFeedbackSubmitting(false);
        }
    };
    
    const handleDismissWelcomeGuide = async () => {
        try {
            // Save to database
            await axios.post(
                `${API_BASE_URL}/users/dismiss-profile-setup-guide`,
                {},
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            // Update state
            setHasSeenWelcomeGuide(true);
            setShowWelcomeGuide(false);
            
            // Save to localStorage as backup
            if (userProfile?._id) {
                localStorage.setItem(`${userProfile._id}_hasSeenWelcomeGuide`, 'true');
            }
        } catch (error) {
            console.error('[WELCOME GUIDE] Failed to dismiss:', error);
            // Still hide the modal even if save failed
            setShowWelcomeGuide(false);
        }
    };

    const handleLoginSuccess = (token) => {
        setAuthToken(token);
        try {
            localStorage.setItem('authToken', token);
        } catch (e) {
            console.warn('Could not persist authToken to localStorage', e);
        }
        navigate('/');
        setIsRegister(false);
    };

    // Set up global handler for viewing public animals from search modal
    useEffect(() => {
        window.handleViewPublicAnimal = (animal) => {
            publicAnimalNav.handleViewPublicAnimal(animal);
        };
        return () => {
            delete window.handleViewPublicAnimal;
        };
    }, [publicAnimalNav]);

    if (!authToken) {
        // Allow unauthenticated users to access search and genetics calculator
        const mainTitle = isRegister ? 'Create Account' : 'Welcome';
        
        // Handle public profile viewing for non-logged-in users
        if (viewingPublicProfile) {
            return (
                <div className="min-h-screen bg-page-bg flex flex-col items-center p-6 font-sans">
                    {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
                    {viewingPublicAnimal && (
                        <ViewOnlyAnimalDetail 
                            animal={viewingPublicAnimal}
                            onClose={handleBackFromPublicAnimal}
                            onCloseAll={handleCloseAllPublicAnimals}
                            API_BASE_URL={API_BASE_URL}
                            authToken={authToken}
                            onViewProfile={(user) => setViewingPublicProfile(user)}
                            onViewAnimal={handleViewPublicAnimal}
                            setModCurrentContext={setModCurrentContext}
                            initialTab={publicAnimalInitialTab}
                        />
                    )}

                    {/* Moderator Action Sidebar - disabled, use mod panel instead */}
                    {false && inModeratorMode && !showModReportQueue && !showAdminPanel && localStorage.getItem('moderationAuthenticated') === 'true' && (
                        <ModeratorActionSidebar
                            isActive={true}
                            onOpenReportQueue={() => setShowModReportQueue(true)}
                            onQuickFlag={handleModQuickFlag}
                            onExitModeration={() => {
                                setInModeratorMode(false);
                                setShowAdminPanel(false);
                                setShowModReportQueue(false);
                                localStorage.removeItem('moderationAuthenticated');
                                setViewingPublicProfile(null);
                                setViewingPublicAnimal(null);
                                navigate('/');
                            }}
                            currentPage={location.pathname}
                            currentContext={modCurrentContext}
                            API_BASE_URL={API_BASE_URL}
                            authToken={authToken}
                        />
                    )}
                    
                    <header className="w-full max-w-7xl bg-white p-4 rounded-xl shadow-lg mb-6">
                        <div className="mb-3">
                            <GlobalSearchBar 
                                API_BASE_URL={API_BASE_URL}
                                onSelectUser={(user) => setViewingPublicProfile(user)}
                                onSelectAnimal={handleViewPublicAnimal}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <CustomAppLogo size="w-10 h-10" />
                            <div className="flex items-center space-x-3">
                                <button 
                                    onClick={() => { setViewingPublicProfile(null); navigate('/'); }}
                                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition flex items-center"
                                >
                                    <LogIn size={18} className="mr-1" /> Login
                                </button>
                            </div>
                        </div>
                    </header>

                    {showUserSearchModal && (
                        <UserSearchModal 
                            onClose={() => setShowUserSearchModal(false)} 
                            showModalMessage={showModalMessage} 
                            API_BASE_URL={API_BASE_URL}
                            onSelectUser={(user) => {
                                setShowUserSearchModal(false);
                                setViewingPublicProfile(user);
                            }}
                        />
                    )}
                    
                    <PublicProfileView 
                        profile={viewingPublicProfile}
                        onBack={() => {
                            setViewingPublicAnimal(null);
                            setPublicAnimalViewHistory([]);
                            setPublicAnimalInitialTab(1);
                            setViewingPublicProfile(null);
                            navigate('/');
                        }}
                        onViewAnimal={handleViewPublicAnimal}
                        API_BASE_URL={API_BASE_URL}
                        authToken={authToken}
                        setModCurrentContext={setModCurrentContext}
                        currentUserIdPublic={userProfile?.id_public}
                        currentUserRole={userProfile?.role}
                    />

                    {/* Moderator Action Sidebar - disabled, use mod panel instead */}
                    {false && inModeratorMode && !showModReportQueue && ['admin', 'moderator'].includes(userProfile?.role) && (
                        <ModeratorActionSidebar
                            isActive={true}
                            onOpenReportQueue={() => setShowModReportQueue(true)}
                            onQuickFlag={handleModQuickFlag}
                            onExitModeration={() => {
                                setInModeratorMode(false);
                                setShowAdminPanel(false);
                                setShowModReportQueue(false);
                                localStorage.removeItem('moderationAuthenticated');
                            }}
                            currentPage={location.pathname}
                            currentContext={modCurrentContext}
                        />
                    )}
                </div>
            );
        }
        
        // Genetics calculator for non-logged-in users
        if (currentView === 'genetics-calculator') {
            return (
                <div className="min-h-screen bg-page-bg flex flex-col items-center p-6 font-sans">
                    {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
                    
                    <header className="w-full max-w-7xl bg-white p-4 rounded-xl shadow-lg mb-6">
                        <div className="mb-3">
                            <GlobalSearchBar 
                                API_BASE_URL={API_BASE_URL}
                                onSelectUser={(user) => { navigate(`/user/${user.id_public}`); }}
                                onSelectAnimal={handleViewPublicAnimal}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <CustomAppLogo size="w-10 h-10" />
                            <div className="flex items-center space-x-3">
                                <button 
                                    onClick={() => navigate('/')}
                                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition flex items-center"
                                >
                                    <LogIn size={18} className="mr-1" /> Login
                                </button>
                            </div>
                        </div>
                    </header>
                    
                    {showUserSearchModal && (
                        <UserSearchModal 
                            onClose={() => setShowUserSearchModal(false)} 
                            showModalMessage={showModalMessage} 
                            API_BASE_URL={API_BASE_URL}
                            onSelectUser={(user) => {
                                setShowUserSearchModal(false);
                                setViewingPublicProfile(user);
                            }}
                        />
                    )}
                    
                    {viewingPublicAnimal && (
                        <ViewOnlyAnimalDetail 
                            animal={viewingPublicAnimal}
                            onClose={handleBackFromPublicAnimal}
                            onCloseAll={handleCloseAllPublicAnimals}
                            API_BASE_URL={API_BASE_URL}
                            authToken={authToken}
                            onViewProfile={(user) => setViewingPublicProfile(user)}
                            onViewAnimal={handleViewPublicAnimal}
                            setModCurrentContext={setModCurrentContext}
                            setShowImageModal={setShowImageModal}
                            setEnlargedImageUrl={setEnlargedImageUrl}
                            initialTab={publicAnimalInitialTab}
                        />
                    )}
                    
                    <GeneticsCalculator
                        API_BASE_URL={API_BASE_URL}
                        authToken={null}
                        userRole={null}
                    />
                </div>
            );
        }
        
        // Donation view for non-logged-in users
        if (currentView === 'donation') {
            return (
                <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6 font-sans">
                    {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
                    
                    <DonationView onBack={() => navigate('/')} authToken={authToken} userProfile={userProfile} />
                </div>
            );
        }
        
        // Default auth view with search button
        return (
            <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6 font-sans">
                {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
                
                {/* Public navigation header */}
                <header className="w-full max-w-7xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                    <CustomAppLogo size="w-10 h-10" />
                    <button 
                        onClick={() => navigate('/genetics-calculator')}
                        className="px-3 py-2 bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg transition flex items-center"
                    >
                        <Cat size={18} className="mr-1" /> Calculator
                    </button>
                </header>
                
                {showUserSearchModal && (
                    <UserSearchModal 
                        onClose={() => setShowUserSearchModal(false)} 
                        showModalMessage={showModalMessage} 
                        API_BASE_URL={API_BASE_URL}
                        onSelectUser={(user) => {
                            setShowUserSearchModal(false);
                            setViewingPublicProfile(user);
                        }}
                    />
                )}
                
                {viewingPublicAnimal && (
                    <ViewOnlyAnimalDetail 
                        animal={viewingPublicAnimal}
                        onClose={handleBackFromPublicAnimal}
                        API_BASE_URL={API_BASE_URL}
                        authToken={authToken}
                        setModCurrentContext={setModCurrentContext}
                        onViewProfile={(user) => setViewingPublicProfile(user)}
                        onViewAnimal={handleViewPublicAnimal}
                        setShowImageModal={setShowImageModal}
                        setEnlargedImageUrl={setEnlargedImageUrl}
                    />
                )}
                
                {/* Logo above all content */}
                <div className="flex flex-col items-center mb-6">
                    <CustomAppLogo size="w-32 h-32" />
                </div>
                
                {/* 3-Column Layout: Donation | Auth Form | Features */}
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* LEFT: Donation Section */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-gradient-to-r from-pink-500 to-red-500 p-2.5 rounded-full">
                                <Heart size={24} className="text-white fill-current" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Support CritterTrack</h3>
                        </div>
                        
                        <p className="text-sm text-gray-700 leading-relaxed mb-4">
                            CritterTrack is <strong>completely free</strong> and developed by a single independent developer 
                            passionate about helping breeders and keepers manage their animals.
                        </p>
                        
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            Your support helps cover server costs and enables continuous improvements. Every contribution, 
                            no matter the size, makes a difference!
                        </p>
                        
                        <RouterLink
                            to="/donation"
                            className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition flex items-center justify-center gap-2"
                        >
                            <Heart size={18} className="fill-current" />
                            Learn More & Donate
                        </RouterLink>
                        
                        <a
                            href="https://ko-fi.com/mousemagic/shop"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={18} />
                            Buy Mouse Magic Genetics Guide
                        </a>
                    </div>
                    
                    {/* MIDDLE: Auth Form */}
                    <div>
                        <AuthView 
                            onLoginSuccess={handleLoginSuccess} 
                            showModalMessage={showModalMessage} 
                            isRegister={isRegister} 
                            setIsRegister={setIsRegister} 
                            mainTitle={mainTitle}
                            onShowTerms={() => setShowTermsModal(true)}
                            onShowPrivacy={() => setShowPrivacyModal(true)}
                            userCount={userCount}
                        />
                    </div>
                    
                    {/* RIGHT: Features Summary */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">What's Included</h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg mt-0.5">
                                    <Cat size={18} className="text-primary-dark" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">Animal Management</h4>
                                    <p className="text-xs text-gray-600">Track your animals with detailed records, photos, and genetic codes</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg mt-0.5">
                                    <BookOpen size={18} className="text-primary-dark" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">Litter Tracking</h4>
                                    <p className="text-xs text-gray-600">Manage breeding pairs, track litters, and monitor offspring</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg mt-0.5">
                                    <Calculator size={18} className="text-primary-dark" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">Genetics Calculator</h4>
                                    <p className="text-xs text-gray-600">Predict offspring outcomes and calculate inbreeding coefficients</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg mt-0.5">
                                    <DollarSign size={18} className="text-primary-dark" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">Budget Tracking</h4>
                                    <p className="text-xs text-gray-600">Monitor expenses and income for your breeding program</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg mt-0.5">
                                    <Search size={18} className="text-primary-dark" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-sm">Public Profiles</h4>
                                    <p className="text-xs text-gray-600">Share your animals and connect with other breeders</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {showTermsModal && <TermsOfService onClose={() => setShowTermsModal(false)} />}
                {showPrivacyModal && <PrivacyPolicy onClose={() => setShowPrivacyModal(false)} />}
            </div>
        );
    }

     return (
        <div className="min-h-screen bg-page-bg flex flex-col items-center font-sans px-7 sm:px-9 pt-4 sm:pt-0">
            {/* Fixed Donation Button - Top Left */}
            <div className="fixed top-4 left-4 z-[60]">
                <button
                    onClick={() => {
                        navigate('/donation');
                        if (!hasSeenDonationHighlight) {
                            setHasSeenDonationHighlight(true);
                            localStorage.setItem('hasSeenDonationHighlight', 'true');
                        }
                    }}
                    className={`bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white p-2.5 rounded-full shadow-lg transition-all hover:scale-110 flex items-center justify-center ${
                        !hasSeenDonationHighlight ? 'animate-pulse ring-4 ring-pink-300 ring-opacity-50' : ''
                    }`}
                    title="Support CritterTrack"
                    aria-label="Support CritterTrack"
                >
                    <Heart size={20} className="fill-current" />
                </button>
                
                {/* First-time tooltip */}
                {!hasSeenDonationHighlight && (
                    <div className="absolute top-full mt-2 left-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap animate-bounce">
                        <div className="absolute bottom-full left-4 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-4 border-b-gray-900"></div>
                        <Heart size={14} className="inline-block align-middle mr-1 text-red-400 fill-current" /> Support CritterTrack
                    </div>
                )}
            </div>
            
            {/* Welcome Guide Modal - Shows once to brand new users on first login */}
            {showWelcomeGuide && (
                <WelcomeGuideModal 
                    onClose={handleDismissWelcomeGuide}
                />
            )}
            
            {showModal && <ModalMessage title={modalMessage.title} message={modalMessage.message} onClose={() => setShowModal(false)} />}
            {showUserSearchModal && (
                <UserSearchModal 
                    onClose={() => setShowUserSearchModal(false)} 
                    showModalMessage={showModalMessage} 
                    API_BASE_URL={API_BASE_URL}
                    onSelectUser={(user) => {
                        setShowUserSearchModal(false);
                        navigate(`/user/${user.id_public}`);
                    }}
                />
            )}
            {viewingPublicAnimal && (
                <ViewOnlyAnimalDetail 
                    animal={viewingPublicAnimal}
                    onClose={handleBackFromPublicAnimal}
                    onCloseAll={handleCloseAllPublicAnimals}
                    API_BASE_URL={API_BASE_URL}
                    authToken={authToken}
                    setModCurrentContext={setModCurrentContext}
                    onViewProfile={(user) => navigate(`/user/${user.id_public}`)}
                    onViewAnimal={handleViewPublicAnimal}
                    setShowImageModal={setShowImageModal}
                    setEnlargedImageUrl={setEnlargedImageUrl}
                />
            )}
            
            <header className="w-full bg-white p-3 sm:p-4 rounded-xl shadow-lg mb-6 max-w-7xl overflow-visible">
                {/* Desktop: Two row layout with search bar on top */}
                <div className="hidden md:block mb-3">
                    <GlobalSearchBar 
                        API_BASE_URL={API_BASE_URL}
                        onSelectUser={(user) => navigate(`/user/${user.id_public}`)}
                        onSelectAnimal={handleViewPublicAnimal}
                    />
                </div>
                
                <div className="hidden md:flex justify-between items-center">
                    <CustomAppLogo size="w-10 h-10" />
                    
                    <nav className="flex space-x-3">
                        <button onClick={() => navigate('/community')} className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'community' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <Users size={18} className="mb-1" />
                            <span>My Feed</span>
                        </button>
                        <button onClick={() => navigate('/')} className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'list' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <Cat size={18} className="mb-1" />
                            <span>Animals</span>
                        </button>
                        <button onClick={() => navigate('/litters')} data-tutorial-target="litters-btn" className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'litters' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <BookOpen size={18} className="mb-1" />
                            <span>Litters</span>
                        </button>
                        <button onClick={() => navigate('/calendar')} className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'calendar' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <Calendar size={18} className="mb-1" />
                            <span>Calendar</span>
                        </button>
                        <button onClick={() => navigate('/budget')} data-tutorial-target="budget-btn" className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'budget' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <DollarSign size={18} className="mb-1" />
                            <span>Budget</span>
                        </button>
                        <button onClick={() => navigate('/marketplace')} className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'marketplace' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <ShoppingBag size={18} className="mb-1" />
                            <span>Available Animals</span>
                        </button>
                        <button onClick={() => navigate('/genetics-calculator')} data-tutorial-target="genetics-btn" className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'genetics-calculator' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <Calculator size={18} className="mb-1" />
                            <span>Calculator</span>
                        </button>
                        <button onClick={() => navigate('/breeder-directory')} data-tutorial-target="breeders-btn" className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'breeder-directory' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <MoonStar size={18} className="mb-1" />
                            <span>Breeders</span>
                        </button>
                        <button onClick={() => setShowInfoTab(true)} className={`px-4 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center text-gray-600 hover:bg-gray-100`}>
                            <BookOpen size={18} className="mb-1" />
                            <span>Help</span>
                        </button>
                    </nav>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => {
                                setShowNotifications(true);
                                setNotificationCount(0);
                                fetchNotificationCount();
                            }}
                            data-tutorial-target="notification-bell"
                            className="relative flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-3 rounded-lg transition duration-150 shadow-sm"
                            title="Notifications"
                        >
                            <Bell size={18} />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </button>
                        
                        <button
                            onClick={() => setShowMessages(true)}
                            data-tutorial-target="messages-btn"
                            className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-lg transition duration-150 shadow-sm ${unreadAdminMessageCount > 0 ? 'bg-red-50 hover:bg-red-100 text-red-700 ring-1 ring-red-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                            title={unreadAdminMessageCount > 0 ? 'Admin message ? response required' : 'Messages'}
                        >
                            <MessageSquare size={18} />
                            {unreadAdminMessageCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {unreadAdminMessageCount > 9 ? '9+' : unreadAdminMessageCount}
                                </span>
                            )}
                            {unreadAdminMessageCount === 0 && unreadMessageCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                </span>
                            )}
                        </button>
                        
                        {/* Avatar / Profile Dropdown */}
                        <div className="relative" ref={profileMenuDesktopRef}>
                            <button
                                onClick={() => setShowProfileMenu(p => !p)}
                                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-black hover:ring-2 hover:ring-primary/60 transition overflow-hidden flex-shrink-0 shadow-md"
                                title="Account"
                            >
                                {(userProfile?.profileImage || userProfile?.profileImageUrl)
                                    ? <img src={userProfile.profileImage || userProfile.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                    : (userProfile?.personalName || userProfile?.breederName || '?').slice(0, 2).toUpperCase()
                                }
                            </button>
                            {showProfileMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                                    <button onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                                        <User size={15} /> Profile
                                    </button>
                                    {['admin', 'moderator'].includes(userProfile?.role) && (
                                        <button onClick={() => { inModeratorMode ? setShowAdminPanel(!showAdminPanel) : setShowModerationAuthModal(true); setShowProfileMenu(false); }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                                            <Shield size={15} /> {inModeratorMode ? 'Panel' : 'Moderation'}
                                        </button>
                                    )}
                                    <hr className="my-1 border-gray-200" />
                                    <button onClick={() => handleLogout(false)}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                                        <LogOut size={15} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile: Four row layout with search bar */}
                <div className="md:hidden overflow-x-visible">
                    {/* First row: Search bar */}
                    <div className="mb-3">
                        <GlobalSearchBar 
                            API_BASE_URL={API_BASE_URL}
                            onSelectUser={(user) => navigate(`/user/${user.id_public}`)}
                            onSelectAnimal={handleViewPublicAnimal}
                        />
                    </div>
                    
                    {/* Second row: Logo and action buttons */}
                    <div className="flex justify-between items-center mb-3 gap-2">
                        <CustomAppLogo size="w-8 h-8" className="flex-shrink-0" />
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                                onClick={() => {
                                    setShowNotifications(true);
                                    setNotificationCount(0);
                                    fetchNotificationCount();
                                }}
                                data-tutorial-target="notification-bell"
                                className="relative flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition duration-150 shadow-sm"
                                title="Notifications"
                            >
                                <Bell size={18} />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </span>
                                )}
                            </button>
                            
                            <button
                                onClick={() => setShowMessages(true)}
                                data-tutorial-target="messages-btn"
                                className={`relative flex items-center justify-center p-2 rounded-lg transition duration-150 shadow-sm ${unreadAdminMessageCount > 0 ? 'bg-red-50 hover:bg-red-100 text-red-700 ring-1 ring-red-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                                title={unreadAdminMessageCount > 0 ? 'Admin message ? response required' : 'Messages'}
                            >
                                <MessageSquare size={18} />
                                {unreadAdminMessageCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                                        {unreadAdminMessageCount > 9 ? '9+' : unreadAdminMessageCount}
                                    </span>
                                )}
                                {unreadAdminMessageCount === 0 && unreadMessageCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                    </span>
                                )}
                            </button>
                            
                            {/* Avatar / Profile Dropdown (mobile) */}
                            <div className="relative" ref={profileMenuMobileRef}>
                                <button
                                    onClick={() => setShowProfileMenu(p => !p)}
                                    className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-black hover:ring-2 hover:ring-primary/60 transition overflow-hidden flex-shrink-0 shadow-md"
                                    title="Account"
                                >
                                    {(userProfile?.profileImage || userProfile?.profileImageUrl)
                                        ? <img src={userProfile.profileImage || userProfile.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                        : (userProfile?.personalName || userProfile?.breederName || '?').slice(0, 2).toUpperCase()
                                    }
                                </button>
                                {showProfileMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                                        <button onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100">
                                            <User size={15} /> Profile
                                        </button>
                                        {['admin', 'moderator'].includes(userProfile?.role) && (
                                            <button onClick={() => { inModeratorMode ? setShowAdminPanel(!showAdminPanel) : setShowModerationAuthModal(true); setShowProfileMenu(false); }}
                                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                                                <Shield size={15} /> {inModeratorMode ? 'Panel' : 'Moderation'}
                                            </button>
                                        )}
                                        <hr className="my-1 border-gray-200" />
                                        <button onClick={() => handleLogout(false)}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                                            <LogOut size={15} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Third row: Navigation row 1 (5 buttons) */}
                    <nav className="grid grid-cols-5 gap-1 mb-1">
                        <button onClick={() => navigate('/community')} className={`px-2 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'community' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <Users size={18} className="mb-0.5" />
                            <span>My Feed</span>
                        </button>
                        <button onClick={() => navigate('/')} className={`px-2 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'list' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <Cat size={18} className="mb-0.5" />
                            <span>Animals</span>
                        </button>
                        <button onClick={() => navigate('/litters')} data-tutorial-target="litters-btn" className={`px-2 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'litters' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <BookOpen size={18} className="mb-0.5" />
                            <span>Litters</span>
                        </button>
                        <button onClick={() => navigate('/calendar')} className={`px-2 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'calendar' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <Calendar size={18} className="mb-0.5" />
                            <span>Calendar</span>
                        </button>
                        <button onClick={() => navigate('/budget')} data-tutorial-target="budget-btn" className={`px-2 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'budget' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <DollarSign size={18} className="mb-0.5" />
                            <span>Budget</span>
                        </button>
                    </nav>

                    {/* Fourth row: Navigation row 2 (4 buttons) */}
                    <nav className="grid grid-cols-4 gap-1">
                        <button onClick={() => navigate('/marketplace')} data-tutorial-target="marketplace-btn" className={`px-2 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'marketplace' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <ShoppingBag size={18} className="mb-0.5" />
                            <span>Available</span>
                        </button>
                        <button onClick={() => navigate('/genetics-calculator')} data-tutorial-target="genetics-btn" className={`px-2 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'genetics-calculator' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <Calculator size={18} className="mb-0.5" />
                            <span>Calculator</span>
                        </button>
                        <button onClick={() => navigate('/breeder-directory')} data-tutorial-target="breeders-btn" className={`px-2 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center ${currentView === 'breeder-directory' ? 'bg-primary text-black shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <MoonStar size={18} className="mb-0.5" />
                            <span>Breeders</span>
                        </button>
                        <button onClick={() => setShowInfoTab(true)} className={`px-2 py-2 text-xs font-medium rounded-lg transition duration-150 flex flex-col items-center text-gray-600 hover:bg-gray-100`}>
                            <BookOpen size={18} className="mb-0.5" />
                            <span>Help</span>
                        </button>
                    </nav>
                </div>

                {/* Admin message alert ? shown when there are unread moderator messages */}
                {unreadAdminMessageCount > 0 && (
                    <div
                        onClick={() => setShowMessages(true)}
                        className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-red-100 transition"
                    >
                        <Shield size={15} className="text-red-600 flex-shrink-0" />
                        <span className="text-sm text-red-700 font-medium flex-1">
                            You have {unreadAdminMessageCount} unread message{unreadAdminMessageCount > 1 ? 's' : ''} from CritterTrack — please respond
                        </span>
                        <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-semibold flex-shrink-0">View</span>
                    </div>
                )}
            </header>

            {/* Moderator Warning Banner */}
            <WarningBanner authToken={authToken} API_BASE_URL={API_BASE_URL} userProfile={userProfile} />
            {/* Moderator Inform Banner */}
            <InformBanner authToken={authToken} API_BASE_URL={API_BASE_URL} />


            

            
            {/* Urgent Broadcast Popup (warning/alert) */}
            <UrgentBroadcastPopup authToken={authToken} API_BASE_URL={API_BASE_URL} />

            {/* Beta Feedback Button - Temporary prominent feedback access for beta users */}
            {!inModeratorMode && (
                <button
                    onClick={() => setShowBugReportModal(true)}
                    className="fixed left-0 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-2 py-4 rounded-r-lg shadow-lg transition-all duration-200 hover:px-3 group"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', top: '50%', transform: 'translateY(-50%)' }}
                    title="Share feedback or report issues"
                >
                    <span className="flex items-center gap-2 text-sm font-medium">
                        <MessageSquare size={16} className="rotate-90" />
                        <span>Beta Feedback</span>
                        <AlertCircle size={14} className="rotate-90 opacity-70" />
                    </span>
                </button>
            )}

            {showNotifications && (
                <NotificationPanel
                    authToken={authToken}
                    API_BASE_URL={API_BASE_URL}
                    onClose={() => {
                        setShowNotifications(false);
                        fetchNotificationCount();
                    }}
                    onNotificationChange={fetchNotificationCount}
                    showModalMessage={showModalMessage}
                    onViewAnimal={(animalId_public, viewFromNotification) => {
                        // Fetch animal with notification flag to override private animal access
                        axios.get(`${API_BASE_URL}/animals/any/${animalId_public}?viewFromNotification=${viewFromNotification}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        })
                            .then(res => {
                                setAnimalToView(res.data);
                                navigate('/view-animal');
                                setShowNotifications(false);
                            })
                            .catch(err => {
                                console.error('Failed to load animal:', err);
                                showModalMessage('Error', 'Could not load animal details.');
                            });
                    }}
                />
            )}
            
            {showMessages && (
                <MessagesView
                    authToken={authToken}
                    API_BASE_URL={API_BASE_URL}
                    onClose={() => {
                        setShowMessages(false);
                        setSelectedConversation(null);
                        fetchUnreadMessageCount();
                    }}
                    showModalMessage={showModalMessage}
                    selectedConversation={selectedConversation}
                    setSelectedConversation={setSelectedConversation}
                    userProfile={userProfile}
                />
            )}
            
            {showBugReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold text-gray-800">Share Your Feedback</h2>
                            <button 
                                onClick={() => setShowBugReportModal(false)}
                                className="text-gray-500 hover:text-gray-700 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">
                            Report bugs, request new features, or share general feedback to help us improve CritterTrack.
                        </p>
                        
                        <form onSubmit={handleBugReportSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={bugReportCategory}
                                    onChange={(e) => setBugReportCategory(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                >
                                    <option value="Bug">Bug</option>
                                    <option value="Feature Request">Feature Request</option>
                                    <option value="General Feedback">General Feedback</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={bugReportDescription}
                                    onChange={(e) => setBugReportDescription(e.target.value)}
                                    placeholder="Describe your bug report, feature request, or feedback in detail. Include steps to reproduce if reporting a bug."
                                    rows={6}
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary resize-none"
                                />
                            </div>
                            
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowBugReportModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={bugReportSubmitting}
                                    className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {bugReportSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={16} />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Report'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Species Customization Feedback Modal */}
            {showFeedbackModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold text-gray-800">Request Species Customization</h3>
                            <button 
                                onClick={() => setShowFeedbackModal(false)}
                                className="text-gray-500 hover:text-gray-700 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Let us know if a species needs different or additional fields (e.g., "Morph" instead of "Color/Coat" for snakes, or missing fields like "Pattern")
                        </p>
                        
                        <form onSubmit={handleSubmitFeedback} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
                                <select
                                    value={feedbackSpecies}
                                    onChange={(e) => setFeedbackSpecies(e.target.value)}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Select a species...</option>
                                    {speciesOptions.map(s => (
                                        <option key={s._id || s.name} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    What fields need to be different or added?
                                </label>
                                <textarea
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    required
                                    rows={4}
                                    placeholder='Example: For snakes, replace "Color" and "Coat" with "Morph", and add a "Pattern" field'
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowFeedbackModal(false);
                                        setFeedbackSpecies('');
                                        setFeedbackText('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={feedbackSubmitting}
                                    className="flex-1 px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center"
                                >
                                    {feedbackSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Mail size={18} className="mr-2" />}
                                    {feedbackSubmitting ? 'Sending...' : 'Send Feedback'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Help/Lessons Tab Modal */}
            {showInfoTab && (
                <InfoTab 
                    onClose={() => setShowInfoTab(false)}
                />
            )}

            {/* Moderation Auth Modal */}
            {showModerationAuthModal && authToken && !inModeratorMode && (
                <ModerationAuthModal
                    isOpen={showModerationAuthModal}
                    onClose={() => setShowModerationAuthModal(false)}
                    onSuccess={() => {
                        setInModeratorMode(true);
                        setShowModerationAuthModal(false);
                        localStorage.setItem('moderationAuthenticated', 'true');
                    }}
                    API_BASE_URL={API_BASE_URL}
                    authToken={authToken}
                />
            )}

            {/* Moderation Panel - Opens while in Moderator Mode */}
            {showAdminPanel && inModeratorMode && ['admin', 'moderator'].includes(userProfile?.role) && (
                <AdminPanel
                    isOpen={showAdminPanel}
                    onClose={() => setShowAdminPanel(false)}
                    authToken={authToken}
                    API_BASE_URL={API_BASE_URL}
                    userRole={userProfile?.role}
                    userEmail={userProfile?.email}
                    userId={userProfile?.id_public}
                    username={userProfile?.personalName}
                    skipAuthentication={true}
                />
            )}

            {/* Moderation Report Queue - Full page view of all reports */}
            {showModReportQueue && inModeratorMode && ['admin', 'moderator'].includes(userProfile?.role) && (
                <ModOversightPanel
                    isOpen={showModReportQueue}
                    onClose={() => setShowModReportQueue(false)}
                    authToken={authToken}
                    API_BASE_URL={API_BASE_URL}
                    onActionTaken={() => {
                        // Refresh or update state if needed
                    }}
                />
            )}

            {/* Moderator Action Sidebar - disabled, use mod panel instead */}
            {false && inModeratorMode && !showModReportQueue && !showAdminPanel && localStorage.getItem('moderationAuthenticated') === 'true' && (
                <ModeratorActionSidebar
                    isActive={true}
                    onOpenReportQueue={() => setShowModReportQueue(true)}
                    onQuickFlag={handleModQuickFlag}
                    onExitModeration={() => {
                        setInModeratorMode(false);
                        setShowAdminPanel(false);
                        setShowModReportQueue(false);
                        localStorage.removeItem('moderationAuthenticated');
                    }}
                    currentPage={location.pathname}
                    currentContext={modCurrentContext}
                />
            )}



            {/* Profile Card + Banners - shown only on desktop in list view */}
            {currentView === 'list' && currentView !== 'profile' && userProfile && (
                <>
                    <div className="w-full max-w-7xl mb-6 hidden sm:flex gap-4 items-stretch">
                        <div className="flex-shrink-0 flex flex-col">
                            <UserProfileCard userProfile={userProfile} API_BASE_URL={API_BASE_URL} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <NotificationsHub authToken={authToken} API_BASE_URL={API_BASE_URL} />
                        </div>
                    </div>
                    <div className="w-full max-w-7xl mb-4 sm:hidden">
                        <NotificationsHub authToken={authToken} API_BASE_URL={API_BASE_URL} />
                    </div>
                </>
            )}

            {/* Animal detail overlay - renders on top of whatever route is active */}
            {animalToView && (() => {
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
                                onUpdateAnimal={handleAnimalFieldUpdate}
                                showModalMessage={showModalMessage}
                                onTransfer={(animal) => { setTransferAnimal(animal); setShowTransferModal(true); }}
                                onViewAnimal={handleViewAnimal}
                                onViewPublicAnimal={handleViewPublicAnimal}
                                onToggleOwned={handleToggleAnimalOwned}
                                userProfile={userProfile}
                                breedingLineDefs={breedingLineDefs}
                                animalBreedingLines={animalBreedingLines}
                                toggleAnimalBreedingLine={toggleAnimalBreedingLine}
                                setAnimalBreedingLinesDirect={setAnimalBreedingLinesDirect}
                                onAddSibling={handleAddSibling}
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
                                showModalMessage={showModalMessage}
                                onViewAnimal={handleViewAnimal}
                                breedingLineDefs={breedingLineDefs}
                                animalBreedingLines={animalBreedingLines}
                                toggleAnimalBreedingLine={toggleAnimalBreedingLine}
                            />
                    );
                }
            })()}

            {/* Animal edit overlay */}
            {animalToEdit && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 flex items-start justify-center p-4">
                    <AnimalForm
                        formTitle={`Edit ${animalToEdit.name}`}
                        animalToEdit={animalToEdit}
                        species={animalToEdit.species}
                        onSave={handleSaveAnimalWithRefresh}
                        onCancel={handleCancelEditAnimal}
                        onDelete={handleDeleteAnimal}
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
                </div>
            )}

            {/* Add Sibling overlay */}
            {siblingTemplate && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 flex items-start justify-center p-4">
                    <AnimalForm
                        formTitle={`Add Sibling (${siblingTemplate.species})`}
                        animalToEdit={null}
                        species={siblingTemplate.species}
                        initialValues={siblingTemplate}
                        onSave={async (...args) => {
                            await handleSaveAnimalWithRefresh(...args);
                            setSiblingTemplate(null);
                        }}
                        onCancel={() => setSiblingTemplate(null)}
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
                </div>
            )}

            <main className="w-full flex-grow max-w-7xl">
                <AppRoutes
                  authToken={authToken}
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                  fetchUserProfile={fetchUserProfile}
                  showModalMessage={showModalMessage}
                  modals={modals}
                  setShowMessages={setShowMessages}
                  setSelectedConversation={setSelectedConversation}
                  setBudgetModalOpen={setBudgetModalOpen}
                  myAnimalsForCalculator={myAnimalsForCalculator}
                  cachedLitters={cachedLitters}
                  setCachedLitters={setCachedLitters}
                  litterCacheTimestamp={litterCacheTimestamp}
                  setLitterCacheTimestamp={setLitterCacheTimestamp}
                  animalToView={animalToView}
                  animalToEdit={animalToEdit}
                  handleViewAnimal={handleViewAnimal}
                  handleEditAnimal={handleEditAnimal}
                  handleSaveAnimal={handleSaveAnimalWithRefresh}
                  handleDeleteAnimal={handleDeleteAnimal}
                  handleBackFromAnimal={handleBackFromAnimal}
                  handleCloseAllAnimals={handleCloseAllAnimals}
                  handleArchiveAnimal={handleArchiveAnimal}
                  privateAnimalInitialTab={privateAnimalInitialTab}
                  privateBetaView={privateBetaView}
                  editReturnPathRef={editReturnPathRef}
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
                  saveBreedingLineDefs={saveBreedingLineDefs}
                  toggleAnimalBreedingLine={toggleAnimalBreedingLine}
                  BL_PRESETS_APP={BL_PRESETS_APP}
                  preSelectedTransferAnimal={preSelectedTransferAnimal}
                  preSelectedTransactionType={preSelectedTransactionType}
                  setPreSelectedTransferAnimal={setPreSelectedTransferAnimal}
                  setPreSelectedTransactionType={setPreSelectedTransactionType}
                  setTransferAnimal={setTransferAnimal}
                  setShowTransferModal={setShowTransferModal}
                  speciesToAdd={speciesToAdd}
                  setSpeciesToAdd={setSpeciesToAdd}
                  speciesOptions={speciesOptions}
                  setSpeciesOptions={setSpeciesOptions}
                  speciesConfigs={speciesConfigs}
                  speciesSearchTerm={speciesSearchTerm}
                  setSpeciesSearchTerm={setSpeciesSearchTerm}
                  speciesCategoryFilter={speciesCategoryFilter}
                  setSpeciesCategoryFilter={setSpeciesCategoryFilter}
                  setShowImageModal={setShowImageModal}
                  setEnlargedImageUrl={setEnlargedImageUrl}
                  showTransferModal={showTransferModal}
                  transferAnimal={transferAnimal}
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
                  API_BASE_URL={API_BASE_URL}
                />
            </main>

            {/* Image Enlarge Modal */}
            {showImageModal && enlargedImageUrl && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4"
                    onClick={() => setShowImageModal(false)}
                >
                    <div className="relative max-w-7xl max-h-full flex flex-col items-center gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowImageModal(false); }}
                            className="self-end text-white hover:text-gray-300 transition"
                        >
                            <X size={32} />
                        </button>
                        <img
                            src={enlargedImageUrl}
                            alt="Enlarged view"
                            className="max-w-full max-h-[75vh] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={(e) => { e.stopPropagation(); handleImageDownload(enlargedImageUrl); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
                        >
                            <Download size={20} />
                            Download Image
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Router Wrapper Component
const AppRouter = () => {
    const [clientIp, setClientIp] = useState(null);

    useEffect(() => {
        const getClientIp = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/client-ip`);
                const detectedIp = response.data.ip || response.data.clientIp;
                setClientIp(detectedIp);
            } catch (error) {
                console.warn('Could not determine IP');
                setClientIp('unknown');
            }
        };
        getClientIp();
    }, []);

    const ADMIN_IP = '86.80.92.156';
    const ADMIN_TOKEN = localStorage.getItem('crittertrack_admin_token');
    const isAdminIP = clientIp === ADMIN_IP;
    const hasAdminToken = ADMIN_TOKEN === 'emergency_access_jan5_2025_secure';

    if (false && clientIp && !isAdminIP && !hasAdminToken) {
        return <MaintenanceMode />;
    }

    if (false && !clientIp) {
        return <MaintenanceMode />;
    }

    return (
        <>
            <Routes>
                <Route path="/animal/:animalId" element={<PublicAnimalPage />} />
                <Route path="/user/:userId" element={<PublicProfilePage />} />
                <Route path="/*" element={<App />} />
            </Routes>
        </>
    );
};

export default AppRouter;



