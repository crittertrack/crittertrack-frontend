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
import MouseGeneticsCalculator from './components/MouseGeneticsCalculator';
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
import FamilyTree from './components/FamilyTree';
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

// const API_BASE_URL = 'http://localhost:5000/api'; // Local development
// const API_BASE_URL = 'https://crittertrack-pedigree-production.up.railway.app/api'; // Direct Railway (for testing)
const API_BASE_URL = '/api'; // Production via Vercel proxy - v2

// App version for cache invalidation - increment to force cache clear
const APP_VERSION = '7.0.4';

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
                console.log(`[ParentCard] Fetching parent ${parentId} of type ${parentType}`);
                // Try to fetch from authenticated endpoint (can access any animal globally)
                try {
                    const response = await axios.get(`${API_BASE_URL}/animals/any/${parentId}`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    if (response.data) {
                        console.log(`[ParentCard] Found parent ${parentId} via /animals/any:`, response.data);
                        setParentData(response.data);
                        setLoading(false);
                        return;
                    }
                } catch (authError) {
                    // If authenticated endpoint fails, try public
                    console.log(`[ParentCard] Parent ${parentId} not found in /animals/any, trying public. Error:`, authError.response?.status, authError.response?.data);
                }

                // Try fetching from global public animals database
                const publicResponse = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${parentId}`);
                if (publicResponse.data && publicResponse.data.length > 0) {
                    console.log(`[ParentCard] Found parent ${parentId} via public endpoint`);
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
    
    // Phase 10a: Use custom auth hook
    const {
        authToken,
        setAuthToken,
        userProfile,
        setUserProfile,
        fetchUserProfile
    } = useAppAuth(API_BASE_URL, showModalMessage);
    
    // Phase 10a: Use idle timeout hook (must come after showModalMessage is defined)
    // Will be initialized after showModalMessage is created below

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [userCount, setUserCount] = useState('...');
    
    // Derive currentView from URL path
    const currentView = location.pathname.split('/')[1] || 'list';
    
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
            console.log(`[Cache Clear] App version changed from ${storedVersion} to ${APP_VERSION}`);
            
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
                console.log(`[Cache Clear] Removed ${key}`);
            });
            
            // Update stored version
            localStorage.setItem('appVersion', APP_VERSION);
            console.log('[Cache Clear] Cache cleared successfully');
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
                
                console.log('[SPECIES FAVORITES] Synced:', mergedFavorites.length, 'favorites');
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
                console.log('[SPECIES FAVORITES] Synced to backend after change');
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
                console.log('Fetching user count from:', `${API_BASE_URL}/public/users/count`);
                const response = await fetch(`${API_BASE_URL}/public/users/count`);
                console.log('User count response status:', response.status);
                if (response.ok) {
                    const data = await response.json();
                    console.log('User count data:', data);
                    const count = data.totalUsers || 'many';
                    const formattedCount = typeof count === 'number' ? count.toLocaleString() : count;
                    console.log('Setting user count to:', formattedCount);
                    setUserCount(formattedCount);
                } else {
                    console.log('User count response not ok:', await response.text());
                }
            } catch (err) {
                console.error('Failed to fetch user count:', err);
                // Keep the "..." placeholder if fetch fails
            }
        };
        fetchUserCount();
    }, [API_BASE_URL, setUserCount]);
    
    // Tutorial context hook
 
    const [animalToEdit, setAnimalToEdit] = useState(null);
    const [speciesToAdd, setSpeciesToAdd] = useState(null); 
    const [speciesOptions, setSpeciesOptions] = useState([]); 
    const [speciesConfigs, setSpeciesConfigs] = useState({}); // Field replacements per species
    const [speciesSearchTerm, setSpeciesSearchTerm] = useState('');
    const [speciesCategoryFilter, setSpeciesCategoryFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState({ title: '', message: '' });
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
    const [viewingPublicAnimal, setViewingPublicAnimal] = useState(null);
    const [publicAnimalViewHistory, setPublicAnimalViewHistory] = useState([]); // Navigation history for public animals
    const [publicAnimalInitialTab, setPublicAnimalInitialTab] = useState(1);
    const [privateAnimalInitialTab, setPrivateAnimalInitialTab] = useState(1);
    const [privateBetaView, setPrivateBetaView] = useState('vertical');
    const [viewAnimalBreederInfo, setViewAnimalBreederInfo] = useState(null);
    const [animalToView, setAnimalToView] = useState(null);
    const [animalViewHistory, setAnimalViewHistory] = useState([]); // Navigation history stack for animals
    const viewReturnPathRef = React.useRef('/'); // Path to return to when closing /view-animal
    const editReturnPathRef = React.useRef('/view-animal'); // Path to return to when closing /edit-animal
    const [detailViewTab, setDetailViewTab] = useState(1); // Tab for detail view
    // -- Breeding Lines ------------------------------------------------------------
    const BL_PRESETS_APP = ['#ef4444','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#6366f1','#a855f7','#ec4899','#64748b'];
    const [breedingLineDefs, setBreedingLineDefs] = useState(() => {
        try { const s = localStorage.getItem('ct_bldefs'); if (s) return JSON.parse(s); } catch {}
        return Array.from({ length: 10 }, (_, i) => ({ id: i, name: '', color: BL_PRESETS_APP[i] }));
    });
    const [animalBreedingLines, setAnimalBreedingLines] = useState(() => {
        try { const s = localStorage.getItem('ct_blassign'); if (s) return JSON.parse(s); } catch {}
        return {};
    });
    // Ref so toggleAnimalBreedingLine always reads the latest defs without stale closure issues
    const breedingLineDefsRef = React.useRef(breedingLineDefs);
    React.useEffect(() => { breedingLineDefsRef.current = breedingLineDefs; }, [breedingLineDefs]);
    // Load from backend on login (overrides localStorage with server truth)
    React.useEffect(() => {
        if (!authToken) return;
        axios.get(`${API_BASE_URL}/users/breeding-lines`, { headers: { Authorization: `Bearer ${authToken}` } })
            .then(r => {
                // Always overwrite from backend ? even empty arrays clear stale data from a previous user
                const defs = Array.isArray(r.data.breedingLineDefs) && r.data.breedingLineDefs.length > 0
                    ? r.data.breedingLineDefs
                    : Array.from({ length: 10 }, (_, i) => ({ id: i, name: '', color: BL_PRESETS_APP[i] }));
                setBreedingLineDefs(defs);
                try { localStorage.setItem('ct_bldefs', JSON.stringify(defs)); } catch {}

                const assign = (r.data.animalBreedingLines && typeof r.data.animalBreedingLines === 'object')
                    ? r.data.animalBreedingLines
                    : {};
                setAnimalBreedingLines(assign);
                try { localStorage.setItem('ct_blassign', JSON.stringify(assign)); } catch {}
            })
            .catch(() => {}); // Silent fail ? use localStorage fallback
    }, [authToken]);
    const saveBreedingLineDefs = (defs, currentAssignments) => {
        setBreedingLineDefs(defs);
        try { localStorage.setItem('ct_bldefs', JSON.stringify(defs)); } catch {}
        if (authToken) {
            return axios.put(`${API_BASE_URL}/users/breeding-lines`,
                { breedingLineDefs: defs, animalBreedingLines: currentAssignments },
                { headers: { Authorization: `Bearer ${authToken}` } }
            ).catch(() => {});
        }
        return Promise.resolve();
    };
    const toggleAnimalBreedingLine = (animalId, lineId) => {
        const current = animalBreedingLines[animalId] || [];
        const updated = current.includes(lineId) ? current.filter(id => id !== lineId) : [...current, lineId];
        const next = { ...animalBreedingLines, [animalId]: updated };
        setAnimalBreedingLines(next);
        try { localStorage.setItem('ct_blassign', JSON.stringify(next)); } catch {}
        if (authToken) {
            axios.put(`${API_BASE_URL}/users/breeding-lines`,
                { breedingLineDefs: breedingLineDefsRef.current, animalBreedingLines: next },
                { headers: { Authorization: `Bearer ${authToken}` } }
            ).catch(err => console.error('Failed to save breeding line assignment:', err));
        }
    };
    // -----------------------------------------------------------------------------
    const [parentCardKey, setParentCardKey] = useState(0); // Force parent cards to refetch when tab opens
    const [showTabs, setShowTabs] = useState(true); // Toggle for collapsible tabs panel
    const [sireData, setSireData] = useState(null);
    const [damData, setDamData] = useState(null);
    const [offspringData, setOffspringData] = useState([]);
    
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
                    
                    console.log('Fetched offspring from API:', allOffspring);
                    setOffspringData(allOffspring);
                } catch (e) {
                    console.log('No offspring endpoint available or no offspring found:', e.message);
                    setOffspringData([]);
                }
            } catch (error) {
                console.error('Error fetching pedigree data:', error);
            }
        };
        
        fetchPedigreeData();
    }, [animalToView, authToken]);
    
    const [showPedigreeChart, setShowPedigreeChart] = useState(false);
    const [copySuccessAnimal, setCopySuccessAnimal] = useState(false);
    const [showQRAnimal, setShowQRAnimal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);
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
    
    // Available animals showcase (mixed: for sale + for stud)
    const [availableAnimals, setAvailableAnimals] = useState([]);
    const [currentAvailableIndex, setCurrentAvailableIndex] = useState(0);
    
    // Transfer modal states
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferAnimal, setTransferAnimal] = useState(null);
    const [preSelectedTransferAnimal, setPreSelectedTransferAnimal] = useState(null);
    const [preSelectedTransactionType, setPreSelectedTransactionType] = useState(null);
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);
    const [transferUserQuery, setTransferUserQuery] = useState('');
    const [transferUserResults, setTransferUserResults] = useState([]);
    const [transferSelectedUser, setTransferSelectedUser] = useState(null);
    const [transferSearching, setTransferSearching] = useState(false);
    const [transferSearchPerformed, setTransferSearchPerformed] = useState(false);
    const [transferPrice, setTransferPrice] = useState('');
    const [transferNotes, setTransferNotes] = useState('');
    
    // Archive states
    const [showArchiveScreen, setShowArchiveScreen] = useState(false);
    const [archivedAnimals, setArchivedAnimals] = useState([]);
    const [soldTransferredAnimals, setSoldTransferredAnimals] = useState([]);
    const [archiveLoading, setArchiveLoading] = useState(false);
    
    // Tutorial modal states
    const [showInfoTab, setShowInfoTab] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuDesktopRef = useRef(null);
    const profileMenuMobileRef = useRef(null);
    const [showModReportQueue, setShowModReportQueue] = useState(false);
    const [modCurrentContext, setModCurrentContext] = useState(null);
    const [inModeratorMode, setInModeratorMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('moderationAuthenticated') === 'true';
        }
        return false;
    });
    const [showModerationAuthModal, setShowModerationAuthModal] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');
    const [showUrgentNotification, setShowUrgentNotification] = useState(false);
    const [urgentNotificationData, setUrgentNotificationData] = useState({ title: '', content: '' });

    const consecutiveAuthErrors = useRef(0);

    const showModalMessage = useCallback((title, message) => {
        setModalMessage({ title, message });
        setShowModal(true);
    }, []);

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

    const handleModQuickFlag = useCallback(async (flagData) => {
        console.log('[MOD ACTION] HANDLER CALLED with:', flagData);
        try {
            console.log('[MOD ACTION] Inside try block');
            console.log('[MOD ACTION] Starting action:', flagData);
            console.log('[MOD ACTION] API_BASE_URL:', API_BASE_URL);
            console.log('[MOD ACTION] authToken:', authToken ? 'present' : 'MISSING');

            // Handle different action types
            if (flagData.action === 'flag') {
                // Create a report for flagged content
                const reportType = flagData.context?.type === 'profile' ? 'profile' : 
                                  flagData.context?.type === 'animal' ? 'animal' : 'message';
                
                // Get the correct user ID based on context type
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                const reportData = {
                    reason: flagData.reason,
                    category: flagData.category,
                    description: `Moderator flag: ${flagData.reason}`,
                    reportedContentId: flagData.context?.id,
                    reportedUserId: userId,
                    isModeratorReport: true
                };

                console.log('[MOD ACTION FLAG] Submitting flag:', { reportType, reportData });

                const response = await axios.post(
                    `${API_BASE_URL}/reports/${reportType}`,
                    reportData,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION FLAG] Success:', response.data);
                showModalMessage('Flag Submitted', 'Content has been flagged and added to the report queue.');
            } 
            else if (flagData.action === 'edit') {
                // Edit/redact content fields
                const contentType = flagData.context?.type;
                const contentId = flagData.context?.id;
                
                console.log('[MOD ACTION EDIT] Submitting edit:', { contentType, contentId, fieldEdits: flagData.fieldEdits });
                
                const response = await axios.patch(
                    `${API_BASE_URL}/moderation/content/${contentType}/${contentId}/edit`,
                    {
                        fieldEdits: flagData.fieldEdits,
                        reason: flagData.reason
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION EDIT] Success:', response.data);
                showModalMessage('Content Edited', 'Content has been updated successfully.');
                // Refresh the current view
                window.location.reload();
            }
            else if (flagData.action === 'warn') {
                // Warn user - get correct user ID based on context type
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                console.log('[MOD ACTION WARN] Warning user:', { userId, reason: flagData.reason, category: flagData.category });
                
                const response = await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/warn`,
                    {
                        reason: flagData.reason,
                        category: flagData.category
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION WARN] Success:', response.data);
                showModalMessage('Warning Sent', `User has been warned. Total warnings: ${response.data.warningCount}`);
            }
            else if (flagData.action === 'suspend') {
                // Suspend user - get correct user ID based on context type
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                console.log('[MOD ACTION SUSPEND] Suspending user:', { userId, reason: flagData.reason, durationDays: flagData.durationDays });
                
                const response = await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/status`,
                    {
                        status: 'suspended',
                        reason: flagData.reason,
                        durationDays: flagData.durationDays
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION SUSPEND] Success:', response.data);
                
                // Check if the suspended user is the current logged-in user
                const isSuspendedUserCurrentUser = userProfile && userProfile.id_public === userId;
                
                if (isSuspendedUserCurrentUser) {
                    // Log out the suspended user
                    console.log('[MOD ACTION SUSPEND] Suspended user is current user - logging them out');
                    
                    // Calculate suspension end time
                    const suspensionEndTime = new Date().getTime() + (flagData.durationDays * 24 * 60 * 60 * 1000);
                    
                    // Store suspension info for display on login screen
                    localStorage.setItem('suspensionEndTime', suspensionEndTime.toString());
                    localStorage.setItem('suspensionReason', flagData.reason || 'Your account has been suspended.');
                    
                    // Log out
                    setAuthToken(null);
                    setUserProfile(null);
                    try {
                        localStorage.removeItem('authToken');
                    } catch (e) {
                        console.warn('Could not clear authToken from localStorage', e);
                    }
                    
                    // Show suspension message with timer
                    showModalMessage(
                        'Account Suspended',
                        `Your account has been suspended for ${flagData.durationDays} days. Reason: ${flagData.reason || 'No reason provided'}. You will be able to log back in after the suspension period ends.`
                    );
                    
                    // Redirect to login
                    navigate('/');
                } else {
                    showModalMessage('User Suspended', `User has been suspended for ${flagData.durationDays} days.`);
                }
            }
            else if (flagData.action === 'ban') {
                // Ban user - get correct user ID based on context type
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                console.log('[MOD ACTION BAN] Banning user:', { userId, reason: flagData.reason, ipBan: flagData.ipBan });
                
                const response = await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/status`,
                    {
                        status: 'banned',
                        reason: flagData.reason,
                        ipBan: flagData.ipBan
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION BAN] Success:', response.data);
                showModalMessage('User Banned', 'User has been permanently banned.');
            }
            else if (flagData.action === 'lift-warning') {
                // Lift warning from user
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                console.log('[MOD ACTION LIFT_WARNING] Lifting warning for user:', { userId, reason: flagData.reason, warningIndex: flagData.warningIndex });
                
                const response = await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/lift-warning`,
                    {
                        reason: flagData.reason,
                        warningIndex: flagData.warningIndex
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION LIFT_WARNING] Success:', response.data);
                showModalMessage('Warning Lifted', `User's warning count is now ${response.data.warningCount}.`);
                
                // Refetch user profile to update warning banner
                if (userProfile && userProfile._id === userId) {
                    try {
                        const updatedProfile = await axios.get(`${API_BASE_URL}/users/profile`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        setUserProfile(updatedProfile.data);
                    } catch (err) {
                        console.error('Failed to refresh user profile:', err);
                    }
                }
            }
            else if (flagData.action === 'lift-suspension') {
                // Lift suspension from user
                console.log('[MOD ACTION LIFT_SUSPENSION] Full flagData:', flagData);
                console.log('[MOD ACTION LIFT_SUSPENSION] Context:', flagData.context);
                
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                // Also try id_public as fallback
                const userIdPublic = flagData.context?.id;
                
                console.log('[MOD ACTION LIFT_SUSPENSION] Lifting suspension for user:', { 
                    userId, 
                    userIdPublic,
                    reason: flagData.reason,
                    contextType: flagData.context?.type
                });
                
                // Use userId if available, otherwise try id_public
                const finalUserId = userId || userIdPublic;
                
                if (!finalUserId) {
                    throw new Error('User ID not found in context');
                }
                
                const response = await axios.post(
                    `${API_BASE_URL}/moderation/users/${finalUserId}/status`,
                    {
                        status: 'active',
                        reason: flagData.reason
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION LIFT_SUSPENSION] Success:', response.data);
                
                // If the response indicates suspension was lifted, store notification for the user
                if (response.data.suspensionLifted) {
                    console.log('[MOD ACTION LIFT_SUSPENSION] Setting notification for user');
                    // Note: This notification is stored in a shared location. In a real app, 
                    // this should be sent to the user's device via websocket/notification system
                    // For now, it will appear when the user logs back in
                }
                
                showModalMessage('Suspension Lifted', 'User account has been reactivated and can now log in.');
            }
            else if (flagData.action === 'lift-ban') {
                // Lift ban from user
                console.log('[MOD ACTION LIFT_BAN] Full flagData:', flagData);
                console.log('[MOD ACTION LIFT_BAN] Context:', flagData.context);
                
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                // Also try id_public as fallback
                const userIdPublic = flagData.context?.id;
                
                console.log('[MOD ACTION LIFT_BAN] Lifting ban for user:', { 
                    userId, 
                    userIdPublic,
                    reason: flagData.reason,
                    contextType: flagData.context?.type
                });
                
                // Use userId if available, otherwise try id_public
                const finalUserId = userId || userIdPublic;
                
                if (!finalUserId) {
                    throw new Error('User ID not found in context');
                }
                
                const response = await axios.post(
                    `${API_BASE_URL}/moderation/users/${finalUserId}/status`,
                    {
                        status: 'active',
                        reason: flagData.reason
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION LIFT_BAN] Success:', response.data);
                showModalMessage('Ban Lifted', 'User account has been reactivated and can now log in.');
            }
        } catch (error) {
            console.error('[MOD ACTION] ERROR OCCURRED:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                errorData: error.response?.data,
                errorResponse: error.response,
                fullError: error
            });
            
            // Extract error message for user feedback
            const errorMsg = error.response?.data?.message 
                || error.response?.data?.error 
                || error.message 
                || 'An error occurred while performing this action.';
            
            console.error('[MOD ACTION] Showing error message to user:', errorMsg);
            showModalMessage('Action Failed', errorMsg);
        }
    }, [showModalMessage, authToken, API_BASE_URL, userProfile]);

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
            showModalMessage('Download Failed', 'Could not download the image. Please try right-clicking and "Save image as..."');
        }
    };

    // Phase 10a: Use idle timeout hook
    useIdleTimeout(authToken, handleLogout, showModalMessage);

    // Poll for maintenance mode and urgent notifications
    useEffect(() => {
        // Skip maintenance check for admins/moderators - they should always have access
        const isStaff = ['admin', 'moderator'].includes(userProfile?.role);
        if (!authToken || isStaff) {
            return; // Don't need to check if staff or not logged in
        }

        const pollForUpdates = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/admin/maintenance-status`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                const data = response.data;
                
                if (data.active && !maintenanceMode) {
                    // Maintenance mode just activated
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
                } else if (!data.active && maintenanceMode) {
                    // Maintenance mode just deactivated
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
    }, [authToken, userProfile, maintenanceMode, API_BASE_URL, showModalMessage, handleLogout]);

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

    // Fetch and cycle through available animals (for sale + for stud mixed)
    // Only runs on desktop (=1024px) since the showcase widget is hidden on mobile
    useEffect(() => {
        const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;

        const fetchAvailableAnimals = async () => {
            if (!authToken || !isDesktop()) return;
            try {
                const response = await axios.get(`${API_BASE_URL}/public/global/animals`);
                if (response.data && response.data.length > 0) {
                    const filtered = response.data.filter(animal =>
                        animal.isForSale === true || animal.isForSale === 'true' ||
                        animal.availableForBreeding === true || animal.availableForBreeding === 'true'
                    );

                    // Enrich with owner country - only fetch profiles not already cached
                    const ownerIds = [...new Set(filtered.map(a => a.ownerId_public).filter(Boolean))];
                    const ownerProfiles = await Promise.all(ownerIds.map(async (id_public) => {
                        try {
                            const profileResp = await axios.get(`${API_BASE_URL}/public/profile/${id_public}`);
                            return { id_public, country: profileResp.data?.country || null };
                        } catch {
                            return { id_public, country: null };
                        }
                    }));
                    const ownerCountryMap = new Map(ownerProfiles.map(p => [p.id_public, p.country]));
                    const enriched = filtered.map(animal => ({
                        ...animal,
                        ownerCountry: ownerCountryMap.get(animal.ownerId_public) || null,
                    }));

                    setAvailableAnimals(enriched.sort(() => Math.random() - 0.5));
                    setCurrentAvailableIndex(0);
                } else {
                    setAvailableAnimals([]);
                }
            } catch (error) {
                console.error('[Available Animals] Failed to fetch:', error);
                setAvailableAnimals([]);
            }
        };

        // Store for manual refresh (e.g. after a user lists an animal)
        window.refreshAvailableAnimals = fetchAvailableAnimals;

        // Only run initial fetch on desktop
        if (isDesktop()) fetchAvailableAnimals();

        // Refresh every 30 minutes - data changes infrequently and widget is desktop-only
        const refreshInterval = setInterval(fetchAvailableAnimals, 1800000);

        return () => {
            clearInterval(refreshInterval);
            delete window.refreshAvailableAnimals;
        };
    }, [authToken, API_BASE_URL]);

    // Auto-cycle through available animals every 30 seconds
    useEffect(() => {
        if (availableAnimals.length > 1 && authToken) {
            const cycleInterval = setInterval(() => {
                setCurrentAvailableIndex(prev => (prev + 1) % availableAnimals.length);
            }, 30000);
            
            return () => clearInterval(cycleInterval);
        }
    }, [availableAnimals.length, authToken]);

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
            console.log('[WELCOME GUIDE] Dismissing...');
            
            // Save to database
            await axios.post(
                `${API_BASE_URL}/users/dismiss-profile-setup-guide`,
                {},
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            
            console.log('[WELCOME GUIDE] Saved to database');
            
            // Update state
            setHasSeenWelcomeGuide(true);
            setShowWelcomeGuide(false);
            
            // Save to localStorage as backup
            if (userProfile?._id) {
                localStorage.setItem(`${userProfile._id}_hasSeenWelcomeGuide`, 'true');
                console.log('[WELCOME GUIDE] Saved to localStorage');
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

    const handleEditAnimal = (animal) => {
        editReturnPathRef.current = location.pathname;
        setAnimalToEdit(animal);
        setSpeciesToAdd(animal.species); 
        navigate('/edit-animal');
    };

    const handleViewAnimal = async (animal, initialTab = 1, initialBetaView = 'vertical') => {
        console.log('[handleViewAnimal] Viewing animal:', animal);
        
        // If we're already viewing an animal, push it to history before navigating to new one
        if (animalToView) {
            setAnimalViewHistory(prev => [...prev, animalToView]);
            console.log('[handleViewAnimal] Pushed current animal to history, stack size:', animalViewHistory.length + 1);
        }
        
        // Fetch latest animal data from backend to ensure privacy settings are current
        let currentAnimal = animal;
        if (authToken) {
            try {
                const response = await axios.get(`${API_BASE_URL}/animals/any/${animal.id_public}`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });
                currentAnimal = response.data;
                console.log('[handleViewAnimal] Fetched latest animal data with sectionPrivacy:', response.data.sectionPrivacy);
            } catch (error) {
                console.warn('[handleViewAnimal] Failed to fetch latest data, using cached:', error);
                // Fall back to the passed animal data if fetch fails
            }
        }
        
        // Normalize parent field names (backend uses sireId_public/damId_public, frontend uses fatherId_public/motherId_public)
        const normalizedAnimal = {
            ...currentAnimal,
            fatherId_public: currentAnimal.fatherId_public || currentAnimal.sireId_public,
            motherId_public: currentAnimal.motherId_public || currentAnimal.damId_public
        };
        
        // Set initial inbreeding coefficient for immediate display
        if (!normalizedAnimal.fatherId_public && !normalizedAnimal.motherId_public) {
            // Animals with no parents have 0% COI by definition
            normalizedAnimal.inbreedingCoefficient = 0;
        }
        // Use existing COI if available, will be updated in background
        
        console.log('[handleViewAnimal] Father ID:', normalizedAnimal.fatherId_public, 'Mother ID:', normalizedAnimal.motherId_public);
        viewReturnPathRef.current = location.pathname;
        setPrivateAnimalInitialTab(initialTab);
        setPrivateBetaView(initialBetaView);
        setAnimalToView(normalizedAnimal);
        navigate('/view-animal');
        
        // Recalculate COI in background (non-blocking) for animals with parents
        if ((normalizedAnimal.fatherId_public || normalizedAnimal.motherId_public) && authToken) {
            axios.get(`${API_BASE_URL}/animals/${normalizedAnimal.id_public}/inbreeding`, {
                params: { generations: 50 },
                headers: { Authorization: `Bearer ${authToken}` }
            })
            .then(coiResponse => {
                // Update the animal with fresh COI
                setAnimalToView(prev => ({
                    ...prev,
                    inbreedingCoefficient: coiResponse.data.inbreedingCoefficient
                }));
            })
            .catch(error => {
                console.log(`Could not calculate COI for animal ${normalizedAnimal.id_public}:`, error);
            });
        }
    };

    // Handle back navigation from animal detail view
    const handleBackFromAnimal = () => {
        if (animalViewHistory.length > 0) {
            // Pop the last animal from history and view it
            const previousAnimal = animalViewHistory[animalViewHistory.length - 1];
            setAnimalViewHistory(prev => prev.slice(0, -1));
            setAnimalToView(previousAnimal);
            console.log('[handleBackFromAnimal] Navigating back to previous animal, remaining history:', animalViewHistory.length - 1);
        } else {
            // No history, return to wherever view-animal was opened from
            setAnimalToView(null);
            setAnimalViewHistory([]);
            const returnPath = viewReturnPathRef.current || '/';
            viewReturnPathRef.current = '/';
            navigate(returnPath);
            console.log('[handleBackFromAnimal] No history, returning to', returnPath);
        }
    };
    
    // Handle closing all animal modals (X button closes entire stack)
    const handleCloseAllAnimals = () => {
        setAnimalToView(null);
        setAnimalViewHistory([]);
        const returnPath = viewReturnPathRef.current || '/';
        viewReturnPathRef.current = '/';
        navigate(returnPath);
        console.log('[handleCloseAllAnimals] Closed entire animal modal stack, returning to', returnPath);
    };
    
    // Handle viewing public animals with history support
    const handleViewPublicAnimal = (animal, initialTab = 1) => {
        console.log('[handleViewPublicAnimal] Viewing public animal:', animal);
        
        // If we're already viewing a public animal, push it to history before navigating to new one
        if (viewingPublicAnimal) {
            setPublicAnimalViewHistory(prev => [...prev, viewingPublicAnimal]);
            console.log('[handleViewPublicAnimal] Pushed current animal to history, stack size:', publicAnimalViewHistory.length + 1);
        }
        
        setPublicAnimalInitialTab(initialTab);
        setViewingPublicAnimal(animal);
    };
    
    // Handle back navigation from public animal detail view
    const handleBackFromPublicAnimal = () => {
        if (publicAnimalViewHistory.length > 0) {
            // Pop the last animal from history and view it
            const previousAnimal = publicAnimalViewHistory[publicAnimalViewHistory.length - 1];
            setPublicAnimalViewHistory(prev => prev.slice(0, -1));
            setPublicAnimalInitialTab(1);
            setViewingPublicAnimal(previousAnimal);
            console.log('[handleBackFromPublicAnimal] Navigating back to previous animal, remaining history:', publicAnimalViewHistory.length - 1);
        } else {
            // No history, close the detail view entirely
            setViewingPublicAnimal(null);
            setPublicAnimalViewHistory([]);
            setPublicAnimalInitialTab(1);
            console.log('[handleBackFromPublicAnimal] No history, closing detail view');
        }
    };
    
    // Handle closing all public animal modals (X button closes entire stack)
    const handleCloseAllPublicAnimals = () => {
        setViewingPublicAnimal(null);
        setPublicAnimalViewHistory([]);
        setPublicAnimalInitialTab(1);
        console.log('[handleCloseAllPublicAnimals] Closed entire public animal modal stack');
    };

    // Set up global handler for viewing public animals from search modal
    useEffect(() => {
        window.handleViewPublicAnimal = (animal) => {
            handleViewPublicAnimal(animal);
        };
        return () => {
            delete window.handleViewPublicAnimal;
        };
    }, [viewingPublicAnimal, publicAnimalViewHistory]);

    const handleSaveAnimal = async (method, url, data) => {
        console.log('[handleSaveAnimal] Called with:', { method, url, dataKeys: Object.keys(data), size: data.size });
        if (userProfile && !data.ownerId_public) {
            data.ownerId_public = userProfile.id_public;
        }
        try {
            console.debug('handleSaveAnimal called:', method, url, data);
            const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
            let response;
            if (method === 'post') {
                console.log('[handleSaveAnimal] Making POST request...');
                response = await axios.post(url, data, { headers });
                console.log('[handleSaveAnimal] POST response:', response?.status);
            } else if (method === 'put') {
                console.log('[handleSaveAnimal] Making PUT request...');
                response = await axios.put(url, data, { headers });
                console.log('[handleSaveAnimal] PUT response:', response?.status);
            }
            
            // After saving, if we were editing an animal, refetch it and patch
            // the local animals list in-place (no full reload needed).
            if (method === 'put' && animalToEdit) {
                try {
                    const refreshedAnimal = await axios.get(`${API_BASE_URL}/animals/${animalToEdit.id_public}`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    const updated = refreshedAnimal.data;
                    setAnimalToView(updated);
                    // Notify list components to patch this single animal in-place
                    try { window.dispatchEvent(new CustomEvent('animal-updated', { detail: updated })); } catch (e) { /* ignore */ }
                } catch (refreshError) {
                    console.error('Failed to refresh animal data after save:', refreshError);
                    setAnimalToView(animalToEdit);
                }
            }
            
            return response;
        } catch (error) {
            console.error('handleSaveAnimal error:', error.response?.data || error.message || error);
            throw error;
        }
    };

    const handleArchiveAnimal = async (animal) => {
        const isArchived = animal.archived;
        const action = isArchived ? 'unarchive' : 'archive';
        const confirmMsg = isArchived 
            ? `Restore ${animal.name} from archive? It will reappear in your main animal lists.`
            : `Archive ${animal.name}? It will be hidden from your main lists but remain in pedigrees.`;
        
        if (!window.confirm(confirmMsg)) return;
        
        try {
            await axios.post(`${API_BASE_URL}/animals/${animal.id_public}/${action}`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            
            const successMsg = isArchived 
                ? `${animal.name} has been restored from archive`
                : `${animal.name} has been archived`;
            
            showModalMessage('Success', successMsg);
            
            // Update the animal in view if open
            if (animalToView && animalToView.id_public === animal.id_public) {
                setAnimalToView({ ...animalToView, archived: !isArchived });
            }
            
            // Trigger a refresh event for any listening components (like AnimalList)
            window.dispatchEvent(new CustomEvent('animal-archived', { detail: { animalId: animal.id_public, archived: !isArchived } }));
            
            // Close detail view if archiving (sends back to main list)
            if (!isArchived) {
                navigate('/');
            }
        } catch (error) {
            console.error(`Failed to ${action} animal:`, error);
            showModalMessage('Error', error.response?.data?.message || `Failed to ${action} animal`);
        }
    };

    const handleDeleteAnimal = async (id_public, animalData = null) => {
        try {
            
            // Always use DELETE - the backend handles both permanent deletion and
            // ownership revert (for formally-transferred animals with originalOwnerId)
            const deleteResp = await axios.delete(`${API_BASE_URL}/animals/${id_public}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            navigate('/');
            if (deleteResp.data?.reverted) {
                showModalMessage('Success', `Animal has been returned to ${animalData?.breederName || 'the original owner'}.`);
            } else {
                showModalMessage('Success', `Animal with ID ${id_public} has been successfully deleted.`);
            }
        } catch (error) {
            console.error('Failed to process animal action:', error);
            showModalMessage('Error', `Failed to process animal action: ${error.response?.data?.message || error.message}`);
        }
    };

    const toggleAnimalOwned = async (animalId, newOwnedValue) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/animals/${animalId}`, {
                isOwned: newOwnedValue
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            // Update animalToView if this is the currently viewed animal
            if (animalToView && animalToView.id_public === animalId) {
                setAnimalToView({ ...animalToView, isOwned: newOwnedValue });
            }
        } catch (error) {
            console.error('Error updating owned status:', error);
            showModalMessage('Error', 'Failed to update owned status.');
        }
    };

    const handleRestoreViewOnlyAnimal = async (id_public) => {
        try {
            await axios.post(`${API_BASE_URL}/animals/${id_public}/restore`, {}, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            showModalMessage('Success', 'View-only animal restored to your list!');
        } catch (error) {
            console.error('Failed to restore animal:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to restore animal');
        }
    };

    const handleSearchTransferUser = async () => {
        if (transferUserQuery.length < 2) return;
        
        setTransferSearching(true);
        setTransferSearchPerformed(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/public/profiles/search`, {
                params: { query: transferUserQuery },
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setTransferUserResults(response.data || []);
        } catch (error) {
            console.error('Error searching users:', error);
            setTransferUserResults([]);
        } finally {
            setTransferSearching(false);
        }
    };

    const handleSubmitTransfer = async () => {
        if (!transferSelectedUser || !transferPrice) {
            showModalMessage('Error', 'Please select a buyer and enter a price');
            return;
        }

        try {
            const transactionData = {
                type: 'sale',
                animalId: transferAnimal.id_public,
                animalName: transferAnimal.name,
                price: parseFloat(transferPrice),
                buyer: transferSelectedUser.breederName || transferSelectedUser.personalName,
                buyerUserId: transferSelectedUser.userId_backend,
                date: new Date().toISOString().split('T')[0],
                notes: transferNotes
            };

            await axios.post(`${API_BASE_URL}/budget/transactions`, transactionData, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            showModalMessage('Success', `Transfer request sent to ${transferSelectedUser.breederName || transferSelectedUser.personalName}!`);
            setShowTransferModal(false);
            setTransferAnimal(null);
            setTransferUserQuery('');
            setTransferUserResults([]);
            setTransferSelectedUser(null);
            setTransferSearchPerformed(false);
            setTransferPrice('');
            setTransferNotes('');
            navigate('/');
        } catch (error) {
            console.error('Error creating transfer:', error);
            showModalMessage('Error', error.response?.data?.message || 'Failed to create transfer');
        }
    };

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
                    
                    <header className="w-full max-w-5xl bg-white p-4 rounded-xl shadow-lg mb-6">
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
                        onBack={() => { setViewingPublicProfile(null); navigate('/'); }}
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
                    
                    <header className="w-full max-w-5xl bg-white p-4 rounded-xl shadow-lg mb-6">
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
                    
                    <MouseGeneticsCalculator
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
                <header className="w-full max-w-5xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
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
        <div className="min-h-screen bg-page-bg flex flex-col font-sans">
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
            
            {/* Available Animal Showcase - Top Right */}
            {currentView === 'list' && !inModeratorMode && availableAnimals.length > 0 && availableAnimals[currentAvailableIndex] && (
                <div className="hidden lg:block absolute top-20 right-4 z-[60] w-48">
                    <div 
                        key={currentAvailableIndex}
                        onClick={() => navigate('/marketplace')}
                        className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] animate-fadeInScale"
                        style={{
                            animation: 'fadeInScale 0.5s ease-in-out'
                        }}
                    >
                        <div className="bg-gradient-to-r from-primary to-accent p-2 relative">
                            <div className="text-xs font-semibold text-black text-center flex items-center justify-center gap-2 flex-wrap">
                                {availableAnimals[currentAvailableIndex].isForSale && (
                                    <><Tag size={14} className="inline-block align-middle mr-1" /> For Sale</>
                                )}
                                {availableAnimals[currentAvailableIndex].availableForBreeding && (
                                    <><Egg size={14} className="inline-block align-middle mr-1" /> For Stud</>
                                )}
                                {availableAnimals[currentAvailableIndex].isForSale && availableAnimals[currentAvailableIndex].availableForBreeding && (
                                    <span className="text-xs">/</span>
                                )}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.refreshAvailableAnimals && window.refreshAvailableAnimals();
                                }}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded transition-colors"
                                title="Refresh available animals"
                            >
                                <RefreshCw size={14} className="text-black" />
                            </button>
                        </div>
                        {availableAnimals[currentAvailableIndex].imageUrl && (
                            <img 
                                src={availableAnimals[currentAvailableIndex].imageUrl} 
                                alt={availableAnimals[currentAvailableIndex].name}
                                className="w-full h-32 object-cover"
                            />
                        )}
                        <div className="p-2">
                            <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-800 truncate">
                                        {availableAnimals[currentAvailableIndex].prefix && `${availableAnimals[currentAvailableIndex].prefix} `}
                                        {availableAnimals[currentAvailableIndex].name}
                                        {availableAnimals[currentAvailableIndex].suffix && ` ${availableAnimals[currentAvailableIndex].suffix}`}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                        {availableAnimals[currentAvailableIndex].species}
                                        {availableAnimals[currentAvailableIndex].variety && ` � ${availableAnimals[currentAvailableIndex].variety}`}
                                    </p>
                                </div>
                                {availableAnimals[currentAvailableIndex].ownerCountry && (
                                    <span
                                        className={`${getCountryFlag(availableAnimals[currentAvailableIndex].ownerCountry)} inline-block h-4 w-6 flex-shrink-0 mt-1`}
                                        title={getCountryName(availableAnimals[currentAvailableIndex].ownerCountry)}
                                    ></span>
                                )}
                            </div>
                            <div className="mt-1 space-y-1">
                                {availableAnimals[currentAvailableIndex].isForSale && availableAnimals[currentAvailableIndex].salePriceAmount && (
                                    <p className="text-xs text-green-600 font-semibold">
                                        Fee: {availableAnimals[currentAvailableIndex].salePriceCurrency === 'Negotiable' ? 'Negotiable' : `${getCurrencySymbol(availableAnimals[currentAvailableIndex].salePriceCurrency)}${availableAnimals[currentAvailableIndex].salePriceAmount}`}
                                    </p>
                                )}
                                {availableAnimals[currentAvailableIndex].availableForBreeding && availableAnimals[currentAvailableIndex].studFeeAmount && (
                                    <p className="text-xs text-purple-600 font-semibold">
                                        Fee: {availableAnimals[currentAvailableIndex].studFeeCurrency === 'Negotiable' ? 'Negotiable' : `${getCurrencySymbol(availableAnimals[currentAvailableIndex].studFeeCurrency)}${availableAnimals[currentAvailableIndex].studFeeAmount}`}
                                    </p>
                                )}
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    {availableAnimals[currentAvailableIndex].gender}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            
            {/* Welcome Guide Modal - Shows once to brand new users on first login */}
            {showWelcomeGuide && (
                <WelcomeGuideModal 
                    onClose={handleDismissWelcomeGuide}
                />
            )}
            
            <div className="flex flex-col items-center p-6 flex-1">
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
            
            <header className="w-full bg-white p-3 sm:p-4 rounded-xl shadow-lg mb-6 max-w-5xl overflow-visible">
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

                    {/* Third row: Navigation row 1 (4 buttons) */}
                    <nav className="grid grid-cols-4 gap-1 mb-1">
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
                            You have {unreadAdminMessageCount} unread message{unreadAdminMessageCount > 1 ? 's' : ''} from CritterTrack ? please respond
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

            {/* Species Customization Request Button */}
            {!inModeratorMode && (
                <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="fixed left-0 z-40 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-2 py-4 rounded-r-lg shadow-lg transition-all duration-200 hover:px-3 group"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', top: 'calc(50% - 120px)' }}
                    title="Request species field customization"
                >
                    <span className="flex items-center gap-2 text-sm font-medium">
                        <Mail size={16} className="rotate-90" />
                        <span>Species Customization</span>
                    </span>
                </button>
            )}

            {/* Beta Feedback Button - Temporary prominent feedback access for beta users */}
            {!inModeratorMode && (
                <button
                    onClick={() => setShowBugReportModal(true)}
                    className="fixed left-0 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-2 py-4 rounded-r-lg shadow-lg transition-all duration-200 hover:px-3 group"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', top: 'calc(50% + 120px)' }}
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
                    <div className="w-full max-w-5xl mb-6 hidden sm:flex gap-4 items-stretch">
                        <div className="flex-shrink-0 flex flex-col">
                            <UserProfileCard userProfile={userProfile} API_BASE_URL={API_BASE_URL} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <NotificationsHub authToken={authToken} API_BASE_URL={API_BASE_URL} />
                        </div>
                    </div>
                    <div className="w-full max-w-5xl mb-4 sm:hidden">
                        <NotificationsHub authToken={authToken} API_BASE_URL={API_BASE_URL} />
                    </div>
                </>
            )}

            <main className="w-full flex-grow max-w-5xl">
                <Routes>
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
                    <Route path="/donation" element={<DonationView onBack={() => navigate('/')} authToken={authToken} userProfile={userProfile} />} />
                    <Route path="/marketplace" element={
                        <Marketplace 
                            authToken={authToken}
                            userProfile={userProfile}
                            showModalMessage={showModalMessage}
                            onViewAnimal={(animalId) => {
                                // Navigate to public animal page
                                window.location.href = `/animal/${animalId}`;
                            }}
                            onViewProfile={(userId) => {
                                // Navigate to public profile page
                                window.location.href = `/user/${userId}`;
                            }}
                            onStartConversation={(conversationData) => {
                                setSelectedConversation(conversationData);
                                setShowMessages(true);
                            }}
                        />
                    } />
                    <Route path="/family-tree" element={
                        userProfile?.id_public === 'CTU2' ? (
                            <FamilyTree
                                authToken={authToken}
                                userProfile={userProfile}
                                showModalMessage={showModalMessage}
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
                    <Route path="/family-tree" element={
                        userProfile?.id_public === 'CTU2' ? (
                            <FamilyTree
                                authToken={authToken}
                                userProfile={userProfile}
                                showModalMessage={showModalMessage}
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
                    <Route path="/animal-tree/:species" element={
                        <AnimalTree
                            authToken={authToken}
                            userProfile={userProfile}
                            showModalMessage={showModalMessage}
                            onViewAnimal={handleViewAnimal}
                            onBack={() => navigate('/')}
                        />
                    } />
                    <Route path="/profile" element={<ProfileView userProfile={userProfile} showModalMessage={showModalMessage} fetchUserProfile={fetchUserProfile} authToken={authToken} onProfileUpdated={setUserProfile} breedingLineDefs={breedingLineDefs} animalBreedingLines={animalBreedingLines} saveBreedingLineDefs={saveBreedingLineDefs} toggleAnimalBreedingLine={toggleAnimalBreedingLine} BL_PRESETS_APP={BL_PRESETS_APP} />} />
                    <Route path="/community" element={
                        <CommunityPage
                            authToken={authToken}
                            API_BASE_URL={API_BASE_URL}
                            userProfile={userProfile}
                        />
                    } />
                    <Route path="/breeder-directory" element={
                        <BreederDirectory
                            authToken={authToken}
                            API_BASE_URL={API_BASE_URL}
                            onBack={() => navigate('/')}
                        />
                    } />
                    <Route path="/litters" element={
                        <LitterManagement
                            authToken={authToken}
                            API_BASE_URL={API_BASE_URL}
                            userProfile={userProfile}
                            showModalMessage={showModalMessage}
                            onViewAnimal={handleViewAnimal}
                            speciesOptions={speciesOptions}
                        />
                    } />
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
                    <Route path="/genetics-calculator" element={
                        <MouseGeneticsCalculator
                            API_BASE_URL={API_BASE_URL}
                            authToken={authToken}
                            myAnimals={myAnimalsForCalculator}
                            userRole={userProfile?.role}
                        />
                    } />
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
                    <Route path="/view-animal" element={
                        animalToView && (() => {
                            // Ownership logic:
                            // 1. ownerId_public === my ID ? PrivateAnimalDetail (full edit; "Return" button if originalOwnerId is set, meaning it was transferred to me)
                            // 2. Otherwise ? ViewOnlyPrivateAnimalDetail (read-only, no edit/delete/transfer buttons)
                            
                            const iCurrentlyOwn = animalToView.ownerId_public === userProfile?.id_public;
                            
                            if (iCurrentlyOwn) {
                                // I own it - full edit access (with return button instead of delete if transferred to me)
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
                                        onUpdateAnimal={setAnimalToView}
                                        showModalMessage={showModalMessage}
                                        onTransfer={(animal) => {
                                            setTransferAnimal(animal);
                                            setShowTransferModal(true);
                                        }}
                                        onViewAnimal={handleViewAnimal}
                                        onViewPublicAnimal={handleViewPublicAnimal}
                                        onToggleOwned={toggleAnimalOwned}
                                        userProfile={userProfile}
                                        breedingLineDefs={breedingLineDefs}
                                        animalBreedingLines={animalBreedingLines}
                                        toggleAnimalBreedingLine={toggleAnimalBreedingLine}
                                    />
                                );
                            } else {
                                // Someone else owns it - read-only (or I created it but transferred it away)
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
                        })()
                    } />
                    <Route path="/view-animal-old-backup" element={
                        animalToView && (
                            (() => {
                                const parseHealthRecords = (data) => {
                                    if (!data) return [];
                                    if (typeof data === 'string') {
                                        try {
                                            return JSON.parse(data);
                                        } catch (e) {
                                            console.error('Failed to parse health records:', e);
                                            return [];
                                        }
                                    }
                                    return Array.isArray(data) ? data : [];
                                };
                                const formattedBirthDate = animalToView.birthDate
                                    ? new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(animalToView.birthDate))
                                    : '';
                                const handleShareAnimal = () => {
                                    const url = `${window.location.origin}/animal/${animalToView.id_public}`;
                                    navigator.clipboard.writeText(url).then(() => {
                                        setCopySuccessAnimal(true);
                                        setTimeout(() => setCopySuccessAnimal(false), 2000);
                                    });
                                };
                                return (
                                    <>
                                    <div className="w-full max-w-5xl mx-auto">
                                        <div className="bg-white border border-gray-300 rounded-t-lg p-6 mb-0">
                                            <div className="flex items-start justify-between mb-0">
                                                <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-gray-800 font-medium">
                                                    <ArrowLeft size={20} className="mr-2" />
                                                    Back to Dashboard
                                                </button>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        onClick={() => setShowQRAnimal(true)}
                                                        data-tutorial-target="share-animal-btn"
                                                        className="px-3 py-2 bg-primary hover:bg-primary/90 text-black font-semibold rounded-lg transition flex items-center gap-2"
                                                    >
                                                        <QrCode size={18} />
                                                        <span className="text-sm">Share</span>
                                                    </button>
                                                    {showQRAnimal && <QRModal url={`${window.location.origin}/animal/${animalToView.id_public}`} title={animalToView.name} onClose={() => setShowQRAnimal(false)} />}
                                                    {userProfile && animalToView.ownerId_public === userProfile.id_public && !animalToView.isViewOnly && (
                                                        <>
                                                            <button 
                                                                data-tutorial-target="edit-animal-btn"
                                                                onClick={() => handleEditAnimal(animalToView)} 
                                                                className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-lg"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => { 
                                                                    setPreSelectedTransferAnimal(animalToView);
                                                                    setPreSelectedTransactionType('animal-sale');
                                                                    navigate('/budget');
                                                                }}
                                                                data-tutorial-target="transfer-animal-btn"
                                                                className="bg-accent hover:bg-accent/90 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2"
                                                            >
                                                                <ArrowLeftRight size={16} />
                                                                Transfer
                                                            </button>
                                                        </>
                                                    )}

                                                </div>
                                            </div>
                                        </div>
                                        {/* Tab Navigation - Collapsible */}
                                        <div className="bg-white border border-t-0 border-gray-300">
                                            {/* Toggle Button */}
                                            <div className="px-4 py-2 flex items-center justify-between border-b border-gray-200">
                                                <span className="text-sm font-semibold text-gray-700">Tabs</span>
                                                <button
                                                    onClick={() => setShowTabs(!showTabs)}
                                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                    title={showTabs ? "Collapse tabs" : "Expand tabs"}
                                                >
                                                    {showTabs ? 'Hide' : 'Show'} 
                                                </button>
                                            </div>

                                            {/* Collapsible Tab Panel */}
                                            {showTabs && (
                                                <div className="px-4 py-3 flex flex-wrap gap-2">
                                                    {[
                            { id: 1, label: 'Overview', icon: ClipboardList, color: 'text-blue-500' },
                            { id: 2, label: 'Status & Privacy', icon: Lock, color: 'text-slate-500' },
                            { id: 3, label: 'Physical', icon: Palette, color: 'text-pink-500' },
                            { id: 4, label: 'Identification', icon: Tag, color: 'text-amber-500' },
                            { id: 5, label: 'Lineage', icon: TreeDeciduous, color: 'text-green-600' },
                            { id: 6, label: 'Breeding', icon: Egg, color: 'text-yellow-500' },
                            { id: 7, label: 'Health', icon: Hospital, color: 'text-red-500' },
                            { id: 8, label: 'Animal Care', icon: Home, color: 'text-teal-500' },
                            { id: 11, label: 'Show', icon: Trophy, color: 'text-yellow-600' }
                                                    ].map(tab => (
                                                        <button
                                                            key={tab.id}
                                                            onClick={() => setDetailViewTab(tab.id)}
                                                            data-tutorial-target={tab.id === 2 ? 'status-privacy-tab' : tab.id === 3 ? 'physical-tab' : tab.id === 4 ? 'identification-tab' : tab.id === 5 ? 'lineage-tab' : tab.id === 6 ? 'breeding-tab' : tab.id === 7 ? 'health-tab' : tab.id === 8 ? 'husbandry-tab' : tab.id === 11 ? 'show-tab' : undefined}
                                                            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded transition-colors ${
                                                                detailViewTab === tab.id 
                                                                    ? 'bg-primary text-black' 
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                            }`}
                                                            title={tab.label}
                                                        >
                                                            {React.createElement(tab.icon, { size: 14, className: `inline-block align-middle flex-shrink-0 mr-1.5 ${tab.color || ''}` })}
                                                            {tab.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Tab Content Wrapper */}
                                        <div className="bg-white border border-t-0 border-gray-300 rounded-b-lg p-6">
                                        {/* Tab 1: Overview */}
                                        {detailViewTab === 1 && (
                                            <div className="space-y-6">
                                                {/* Main Card - Two Column Layout */}
                                                <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden relative">
                                                    {/* Public Profile Toggle - Top Right */}
                                                    <div className="absolute top-4 right-4 z-10">
                                                        <button
                                                            type="button"
                                                            data-tutorial-target="detail-private-toggle"
                                                            onClick={async () => {
                                                                const newIsDisplay = !animalToView.isDisplay;
                                                                try {
                                                                    const response = await fetch(`${API_BASE_URL}/animals/${animalToView.id_public}`, {
                                                                        method: 'PUT',
                                                                        headers: {
                                                                            'Content-Type': 'application/json',
                                                                            'Authorization': `Bearer ${authToken}`
                                                                        },
                                                                        body: JSON.stringify({ isDisplay: newIsDisplay })
                                                                    });
                                                                    if (response.ok) {
                                                                        setAnimalToView({ ...animalToView, isDisplay: newIsDisplay });
                                                                    } else {
                                                                        showModalMessage('Error', 'Failed to update visibility.');
                                                                    }
                                                                } catch (err) {
                                                                    console.error('Error updating visibility:', err);
                                                                    showModalMessage('Error', 'Failed to update visibility.');
                                                                }
                                                            }}
                                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition ${
                                                                animalToView.isDisplay 
                                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {animalToView.isDisplay ? (
                                                                <>
                                                                    <Eye size={16} />
                                                                    <span>Public</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <EyeOff size={16} />
                                                                    <span>Private</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="flex relative">
                                                        {/* Left Column - Image */}
                                                        <div className="w-1/3 p-4 sm:p-6 flex flex-col items-center justify-center relative min-h-80">
                                                            {/* Birthdate badge */}
                                                            {animalToView.birthDate && (
                                                                <div className="absolute top-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-0.5 rounded">
                                                                    {formatDate(animalToView.birthDate)}
                                                                </div>
                                                            )}

                                                            {/* Gender badge */}
                                                            <div className="absolute top-2 right-2">
                                                                {animalToView.gender === 'Male' ? <Mars size={20} strokeWidth={2.5} className="text-blue-600" /> : animalToView.gender === 'Female' ? <Venus size={20} strokeWidth={2.5} className="text-pink-600" /> : animalToView.gender === 'Intersex' ? <VenusAndMars size={20} strokeWidth={2.5} className="text-purple-500" /> : <Circle size={20} strokeWidth={2.5} className="text-gray-500" />}
                                                            </div>

                                                            {/* Profile Image */}
                                                            <div className="flex items-center justify-center h-40 w-full">
                                                                {(animalToView.imageUrl || animalToView.photoUrl) ? (
                                                                    <img 
                                                                        src={animalToView.imageUrl || animalToView.photoUrl} 
                                                                        alt={animalToView.name} 
                                                                        className="max-w-32 max-h-32 w-auto h-auto object-contain rounded-md cursor-pointer hover:opacity-80 transition"
                                                                        onClick={() => {
                                                                            setEnlargedImageUrl(animalToView.imageUrl || animalToView.photoUrl);
                                                                            setShowImageModal(true);
                                                                        }}
                                                                        title="Click to enlarge"
                                                                    />
                                                                ) : (
                                                                    <div className="w-32 h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                                        <Cat size={48} />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Icon row */}
                                                            <div className="flex justify-center items-center space-x-2 py-2 mt-2">
                                                                {animalToView.isOwned ? (
                                                                    <Heart size={14} className="text-black" />
                                                                ) : (
                                                                    <HeartOff size={14} className="text-black" />
                                                                )}
                                                                {animalToView.showOnPublicProfile ? (
                                                                    <Eye size={14} className="text-black" />
                                                                ) : (
                                                                    <EyeOff size={14} className="text-black" />
                                                                )}
                                                                {animalToView.isInMating && <Hourglass size={14} className="text-black" />}
                                                                {animalToView.isPregnant && <Bean size={14} className="text-black" />}
                                                                {animalToView.isNursing && <Milk size={14} className="text-black" />}
                                                                {animalToView.isNeutered && <Scissors size={14} className="text-black" />}
                                                            </div>

                                                            {/* Status text */}
                                                            <div className="text-sm font-medium text-gray-700 mt-2">
                                                                {animalToView.isViewOnly ? 'Sold' : (animalToView.status || 'Unknown')}
                                                            </div>
                                                        </div>

                                                        {/* Right Column - Info */}
                                                        <div className="w-2/3 p-4 sm:p-6 flex flex-col border-l border-gray-300 space-y-3">
                                                            {/* Species/Breed/Strain/CTC - At Top */}
                                                            <p className="text-sm text-gray-600">
                                                                {animalToView.species}
                                                                {animalToView.breed && ` � ${animalToView.breed}`}
                                                                {animalToView.strain && ` � ${animalToView.strain}`}
                                                                {animalToView.id_public && ` � ${animalToView.id_public}`}
                                                            </p>

                                                            {/* Name */}
                                                            <h2 className="text-2xl font-bold text-gray-800">
                                                                {animalToView.prefix ? `${animalToView.prefix} ` : ''}
                                                                {animalToView.name}
                                                                {animalToView.suffix ? ` ${animalToView.suffix}` : ''}
                                                            </h2>

                                                            {/* Appearance */}
                                                            {(animalToView.color || animalToView.coat || animalToView.coatPattern || animalToView.earset) && (
                                                                <p className="text-sm text-gray-700">
                                                                    {[
                                                                        animalToView.color,
                                                                        animalToView.coatPattern,
                                                                        animalToView.coat,
                                                                        animalToView.earset
                                                                    ].filter(Boolean).join(' ')}
                                                                </p>
                                                            )}

                                                            {/* Date of Birth */}
                                                            {animalToView.birthDate && (
                                                                <div className="text-sm text-gray-700 space-y-1">
                                                                    <p>
                                                                        Date of Birth: {formatDate(animalToView.birthDate)} ~ {(() => {
                                                                            const birth = new Date(animalToView.birthDate);
                                                                            const endDate = animalToView.deceasedDate ? new Date(animalToView.deceasedDate) : new Date();
                                                                            let years = endDate.getFullYear() - birth.getFullYear();
                                                                            let months = endDate.getMonth() - birth.getMonth();
                                                                            let days = endDate.getDate() - birth.getDate();
                                                                            
                                                                            if (days < 0) {
                                                                                months--;
                                                                                const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
                                                                                days += prevMonth.getDate();
                                                                            }
                                                                            if (months < 0) {
                                                                                years--;
                                                                                months += 12;
                                                                            }
                                                                            
                                                                            if (years > 0) {
                                                                                return `${years}y ${months}m ${days}d`;
                                                                            } else if (months > 0) {
                                                                                return `${months}m ${days}d`;
                                                                            } else {
                                                                                return `${days}d`;
                                                                            }
                                                                        })()}
                                                                    </p>
                                                                    {animalToView.deceasedDate && (
                                                                        <p className="text-red-600">
                                                                            Deceased: {formatDate(animalToView.deceasedDate)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                            
                                                            {/* Tags at bottom of right column */}
                                                            {animalToView.tags && animalToView.tags.length > 0 && (
                                                                <div className="border-t border-gray-200 pt-3 mt-3">
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {animalToView.tags.map((tag, idx) => (
                                                                            <span key={idx} className="inline-flex items-center bg-primary text-black text-xs font-semibold px-2 py-1 rounded-full">
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Identification Card */}
                                                {(animalToView.microchipNumber || animalToView.registryCode || animalToView.breederAssignedId || animalToView.pedigreeRegId) && (
                                                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-700 mb-2">Identification</h4>
                                                        <div className="text-sm space-y-1">
                                                            {animalToView.microchipNumber && <div><strong>Microchip:</strong> {animalToView.microchipNumber}</div>}
                                                            {animalToView.registryCode && <div><strong>Registry:</strong> {animalToView.registryCode}</div>}
                                                            {animalToView.breederAssignedId && <div><strong>Identification:</strong> {animalToView.breederAssignedId}</div>}
                                                            {animalToView.pedigreeRegId && <div><strong>Pedigree Reg ID:</strong> {animalToView.pedigreeRegId}</div>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Genetic Code Card */}
                                                {animalToView.geneticCode && (
                                                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-700 mb-2">Genetic Code</h4>
                                                        <div className="text-sm font-mono bg-gray-50 p-2 rounded border border-gray-200">
                                                            {animalToView.geneticCode}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Health Card */}
                                                {(animalToView.currentWeight || animalToView.bcs || animalToView.growthRecords?.length > 0 || animalToView.medicalConditions || animalToView.medications) && (
                                                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-700 mb-2">Health</h4>
                                                        <div className="space-y-3 text-sm">
                                                            {/* Current Measurements Summary */}
                                                            {(() => {
                                                                // Compute current measurements from growth records if available
                                                                let currentWeight = null;
                                                                let currentLength = null;
                                                                let growthRecords = animalToView.growthRecords;
                                                                
                                                                // Parse growthRecords if it's a string
                                                                if (typeof growthRecords === 'string') {
                                                                    try {
                                                                        growthRecords = JSON.parse(growthRecords);
                                                                    } catch (e) {
                                                                        growthRecords = [];
                                                                    }
                                                                }
                                                                
                                                                if (growthRecords && Array.isArray(growthRecords) && growthRecords.length > 0) {
                                                                    const sorted = [...growthRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
                                                                    currentWeight = sorted[0].weight;
                                                                    const withLength = sorted.find(r => r.length);
                                                                    currentLength = withLength ? withLength.length : null;
                                                                }
                                                                
                                                                return (currentWeight || animalToView.bcs || currentLength) && (
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {currentWeight && (
                                                                            <div>
                                                                                <strong>Weight:</strong> {currentWeight}{animalToView.measurementUnits?.weight || 'g'}
                                                                                {animalToView.weightTrend && (
                                                                                    <span className={animalToView.weightTrend === 'up' ? 'text-red-600' : animalToView.weightTrend === 'down' ? 'text-green-600' : 'text-gray-600'}>
                                                                                        {animalToView.weightTrend === 'up' ? ' ?' : animalToView.weightTrend === 'down' ? ' ?' : ' ?'}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {animalToView.bcs && <div><strong>BCS:</strong> {animalToView.bcs}</div>}
                                                                        {currentLength && (
                                                                            <div><strong>Length:</strong> {currentLength} {animalToView.measurementUnits?.length || 'cm'}</div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                            
                                                            {/* Conditions and Medications */}
                                                            {(animalToView.medicalConditions || animalToView.medications) && (
                                                                <div className="border-t border-gray-200 pt-2 space-y-2">
                                                                    {animalToView.medicalConditions && (() => {
                                                                        const parsed = parseHealthRecords(animalToView.medicalConditions);
                                                                        return parsed && parsed.length > 0 ? (
                                                                            <div>
                                                                                <strong>Conditions:</strong>
                                                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                                                    {parsed.map((condition, idx) => (
                                                                                        <li key={idx} className="text-gray-700">
                                                                                            {condition.condition || condition.name}
                                                                                            {condition.notes && <span className="text-gray-600"> - {condition.notes}</span>}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        ) : null;
                                                                    })()}
                                                                    {animalToView.medications && (() => {
                                                                        const parsed = parseHealthRecords(animalToView.medications);
                                                                        return parsed && parsed.length > 0 ? (
                                                                            <div>
                                                                                <strong>Medications:</strong>
                                                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                                                    {parsed.map((med, idx) => (
                                                                                        <li key={idx} className="text-gray-700">
                                                                                            {med.medication || med.name}
                                                                                            {med.notes && <span className="text-gray-600"> - {med.notes}</span>}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        ) : null;
                                                                    })()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Reproductive Status Card */}
                                                {!animalToView.isNeutered && (animalToView.heatStatus || animalToView.lastHeatDate || animalToView.matingDate) && (
                                                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-700 mb-2"><Leaf size={16} className="inline-block align-middle mr-2 text-green-600" /> Reproductive Status</h4>
                                                        <div className="text-sm space-y-1">
                                                            {animalToView.heatStatus && <div><strong>Heat Status:</strong> {animalToView.heatStatus}</div>}
                                                            {animalToView.lastHeatDate && <div><strong>Last Heat:</strong> {formatDate(animalToView.lastHeatDate)}</div>}
                                                            {animalToView.matingDate && <div><strong>Last Mating:</strong> {animalToView.matingDate}</div>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Parents Card - Always Visible */}
                                                <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                                                    <h4 className="font-semibold text-gray-700 mb-4">Parents</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Sire Card */}
                                                        {sireData ? (
                                                            <div 
                                                                onClick={() => {
                                                                    setAnimalToView(sireData);
                                                                    setDetailViewTab(1);
                                                                }}
                                                                className="bg-gray-50 rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition"
                                                            >
                                                                <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center mb-3">
                                                                    <AnimalImage src={sireData.imageUrl || sireData.photoUrl} alt={sireData.name} className="w-full h-full object-cover" iconSize={32} />
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="font-semibold text-gray-800 text-sm">
                                                                        {sireData.prefix ? `${sireData.prefix} ` : ''}{sireData.name}{sireData.suffix ? ` ${sireData.suffix}` : ''}
                                                                    </p>
                                                                    <p className="text-xs text-gray-600 mt-1">
                                                                        {sireData.gender}
                                                                    </p>
                                                                    {sireData.birthDate && (
                                                                        <p className="text-xs text-gray-500 mt-2">
                                                                            Born: {formatDate(sireData.birthDate)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-3">
                                                                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                                                                    <Cat size={48} className="text-gray-400" />
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="text-sm text-gray-500 italic">Father unknown</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Dam Card */}
                                                        {damData ? (
                                                            <div 
                                                                onClick={() => {
                                                                    setAnimalToView(damData);
                                                                    setDetailViewTab(1);
                                                                }}
                                                                className="bg-gray-50 rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition"
                                                            >
                                                                <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center mb-3">
                                                                    <AnimalImage src={damData.imageUrl || damData.photoUrl} alt={damData.name} className="w-full h-full object-cover" iconSize={32} />
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="font-semibold text-gray-800 text-sm">
                                                                        {damData.prefix ? `${damData.prefix} ` : ''}{damData.name}{damData.suffix ? ` ${damData.suffix}` : ''}
                                                                    </p>
                                                                    <p className="text-xs text-gray-600 mt-1">
                                                                        {damData.gender}
                                                                    </p>
                                                                    {damData.birthDate && (
                                                                        <p className="text-xs text-gray-500 mt-2">
                                                                            Born: {formatDate(damData.birthDate)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-3">
                                                                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                                                                    <Cat size={48} className="text-gray-400" />
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className="text-sm text-gray-500 italic">Mother unknown</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Offspring Card */}
                                                {offspringData && offspringData.length > 0 && (
                                                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-700 mb-4">Offspring ({offspringData.length})</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {offspringData.map(offspring => (
                                                                <div 
                                                                    key={offspring.id_public}
                                                                    onClick={() => {
                                                                        setAnimalToView(offspring);
                                                                        setDetailViewTab(1);
                                                                    }}
                                                                    className="bg-gray-50 rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition"
                                                                >
                                                                    <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center mb-3">
                                                                        <AnimalImage src={offspring.imageUrl || offspring.photoUrl} alt={offspring.name} className="w-full h-full object-cover" iconSize={32} />
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <p className="font-semibold text-gray-800 text-sm">
                                                                            {offspring.prefix ? `${offspring.prefix} ` : ''}{offspring.name}{offspring.suffix ? ` ${offspring.suffix}` : ''}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                            {offspring.gender}
                                                                        </p>
                                                                        {offspring.birthDate && (
                                                                            <p className="text-xs text-gray-500 mt-2">
                                                                                Born: {formatDate(offspring.birthDate)}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}


                                            </div>
                                        )}

                                        {/* Tab 2: Status & Privacy */}
                                        {detailViewTab === 2 && (
                                            <div className="space-y-6">
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <span className="text-sm text-gray-600">Status</span>
                                                            <p className="font-medium">{animalToView.status || 'Unknown'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm text-gray-600 flex items-center gap-1"><Home size={14} /> Keeper</span>
                                                            <p className="font-medium">{animalToView.keeperName || ''}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm text-gray-600">Public Profile</span>
                                                            <p className="font-medium">{animalToView.showOnPublicProfile ? 'Yes' : 'No'}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm text-gray-600">Owned</span>
                                                            <p className="font-medium">{animalToView.isOwned ? 'Yes' : 'No'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {animalToView.keeperHistory && animalToView.keeperHistory.length > 0 && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700"><Home size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Keeper History</h3>
                                                        <div className="space-y-2">
                                                            {animalToView.keeperHistory.map((entry, idx) => (
                                                                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded border border-gray-200">
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-semibold text-gray-800">{entry.name || 'Unknown'}</p>
                                                                        {entry.userId_public && <p className="text-xs text-gray-400 font-mono">{entry.userId_public}</p>}
                                                                    </div>
                                                                    {entry.country && (
                                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                                            <span className={`${getCountryFlag(entry.country)} inline-block h-4 w-6`}></span>
                                                                            <span className="text-xs text-gray-500">{getCountryName(entry.country)}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Breeder Info</h3>
                                                    <div className="text-sm">
                                                        <strong>Breeder:</strong>{' '}
                                                        {animalToView.manualBreederName ? (
                                                            <span>{animalToView.manualBreederName}</span>
                                                        ) : animalToView.breederId_public ? (
                                                            viewAnimalBreederInfo ? (
                                                                <span>
                                                                    {(() => {
                                                                        const showPersonal = viewAnimalBreederInfo.showPersonalName ?? false;
                                                                        const showBreeder = viewAnimalBreederInfo.showBreederName ?? false;
                                                                        
                                                                        if (showPersonal && showBreeder && viewAnimalBreederInfo.personalName && viewAnimalBreederInfo.breederName) {
                                                                            return `${viewAnimalBreederInfo.personalName} (${viewAnimalBreederInfo.breederName})`;
                                                                        } else if (showBreeder && viewAnimalBreederInfo.breederName) {
                                                                            return viewAnimalBreederInfo.breederName;
                                                                        } else if (showPersonal && viewAnimalBreederInfo.personalName) {
                                                                            return viewAnimalBreederInfo.personalName;
                                                                        } else {
                                                                            return 'Unknown Breeder';
                                                                        }
                                                                    })()}
                                                                </span>
                                                            ) : (
                                                                <span className="font-mono text-accent">{animalToView.breederId_public}</span>
                                                            )
                                                        ) : (
                                                            <span className="text-gray-500 italic">Not specified</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tab 4: Appearance */}
                                        {detailViewTab === 4 && (
                                            <div className="space-y-6">
                                                {/* Appearance - Always show */}
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                    <h3 className="text-lg font-semibold text-gray-700"><Sparkles size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Appearance</h3>
                                                    {(() => {
                                                        const fields = [
                                                            { key: 'color', label: 'Color' },
                                                            { key: 'coatPattern', label: 'Pattern' },
                                                            { key: 'coat', label: 'Coat Type' },
                                                            { key: 'earset', label: 'Earset' },
                                                            { key: 'phenotype', label: 'Phenotype' },
                                                            { key: 'morph', label: 'Morph' },
                                                            { key: 'markings', label: 'Markings' },
                                                            { key: 'eyeColor', label: 'Eye Color' },
                                                            { key: 'nailColor', label: 'Nail/Claw Color' },
                                                            { key: 'carrierTraits', label: 'Carrier Traits' },
                                                        ].filter(f => animalToView[f.key]);
                                                        
                                                        return fields.length > 0 ? (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                {fields.map(f => (
                                                                    <div key={f.key}><span className="text-gray-600">{f.label}:</span> <strong>{animalToView[f.key]}</strong></div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm text-gray-500">No appearance data recorded yet.</div>
                                                        );
                                                    })()}
                                                </div>
                                                
                                                {/* Genetic Code - Always show */}
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <h3 className="text-lg font-semibold text-gray-700 mb-2"><Dna size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Genetic Code</h3>
                                                    <p className="text-sm font-mono">{animalToView.geneticCode || 'Not specified'}</p>
                                                </div>
                                                
                                                {/* Life Stage - Always show */}
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <span className="text-sm text-gray-600">Life Stage:</span> <strong>{animalToView.lifeStage || 'Not specified'}</strong>
                                                </div>

                                                {/* Current Measurements - Always show */}
                                                {(() => {
                                                    let growthRecords = animalToView.growthRecords;
                                                    if (typeof growthRecords === 'string') {
                                                        try {
                                                            growthRecords = JSON.parse(growthRecords);
                                                        } catch (e) {
                                                            growthRecords = [];
                                                        }
                                                    }
                                                    
                                                    // Compute current weight, length, and height from growth records
                                                    let currentWeight = null;
                                                    let currentLength = null;
                                                    let currentHeight = null;
                                                    if (growthRecords && Array.isArray(growthRecords) && growthRecords.length > 0) {
                                                        const sorted = [...growthRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
                                                        currentWeight = sorted[0].weight;
                                                        const withLength = sorted.find(r => r.length);
                                                        currentLength = withLength ? withLength.length : null;
                                                        const withHeight = sorted.find(r => r.height);
                                                        currentHeight = withHeight ? withHeight.height : null;
                                                    }
                                                    
                                                    // Fallback to stored values if no growth records
                                                    if (!currentWeight) currentWeight = animalToView.currentWeight;
                                                    
                                                    // Always show Current Measurements section
                                                    return (
                                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                            <h3 className="text-lg font-semibold text-gray-700">Current Measurements</h3>
                                                            {(currentWeight || animalToView.bcs || currentLength || currentHeight) ? (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                    {currentWeight && (
                                                                        <div><span className="text-gray-600">Weight:</span> <strong>{currentWeight} {animalToView.measurementUnits?.weight || 'g'}</strong></div>
                                                                    )}
                                                                    {animalToView.bcs && (
                                                                        <div><span className="text-gray-600">BCS:</span> <strong>{animalToView.bcs}</strong></div>
                                                                    )}
                                                                    {currentLength && (
                                                                        <div><span className="text-gray-600">Length:</span> <strong>{currentLength} {animalToView.measurementUnits?.length || 'cm'}</strong></div>
                                                                    )}
                                                                    {currentHeight && (
                                                                        <div><span className="text-gray-600">Height:</span> <strong>{currentHeight} {animalToView.measurementUnits?.length || 'cm'}</strong></div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="text-sm text-gray-500">No measurements recorded yet.</div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                {/* Growth Curve Charts - Weight and Length */}
                                                {(() => {
                                                    let growthRecords = animalToView.growthRecords;
                                                    if (typeof growthRecords === 'string') {
                                                        try {
                                                            growthRecords = JSON.parse(growthRecords);
                                                        } catch (e) {
                                                            growthRecords = [];
                                                        }
                                                    }
                                                    
                                                    // Ensure growthRecords is an array
                                                    if (!growthRecords) growthRecords = [];
                                                    
                                                    // If fewer than 1 entry, show empty chart placeholder
                                                    if (growthRecords.length < 1) {
                                                        return (
                                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Growth Curves</h3>
                                                                <svg width="100%" height="300" viewBox="0 0 500 300" style={{ maxWidth: '100%' }} preserveAspectRatio="xMidYMid meet">
                                                                    {/* Grid lines */}
                                                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                                                        const y = 20 + 260 * (1 - ratio);
                                                                        return (
                                                                            <g key={`grid-${i}`}>
                                                                                <line x1={70} y1={y} x2={470} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                                                                                <text x={58} y={y} textAnchor="end" dy="0.3em" fontSize="11" fill="#999">?</text>
                                                                            </g>
                                                                        );
                                                                    })}
                                                                    
                                                                    {/* Axes */}
                                                                    <line x1={70} y1={20} x2={70} y2={280} stroke="#333" strokeWidth="2" />
                                                                    <line x1={70} y1={280} x2={470} y2={280} stroke="#333" strokeWidth="2" />
                                                                    
                                                                    {/* Empty state message */}
                                                                    <text x={270} y={150} textAnchor="middle" fontSize="14" fill="#999">
                                                                        No growth data recorded yet
                                                                    </text>
                                                                </svg>
                                                                <p className="text-xs text-gray-500 mt-2">Growth curves will appear once measurement entries are added.</p>
                                                            </div>
                                                        );
                                                    }
                                                    
                                                    // Full interactive charts with 1+ entries
                                                    return (() => {
                                                        const sorted = [...growthRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
                                                        const weights = sorted.map(r => parseFloat(r.weight) || 0).filter(w => w > 0);
                                                        const lengths = sorted
                                                            .filter(record => record.length && !isNaN(parseFloat(record.length)))
                                                            .map(record => parseFloat(record.length));
                                                        const heights = sorted
                                                            .filter(record => record.height && !isNaN(parseFloat(record.height)))
                                                            .map(record => parseFloat(record.height));
                                                        
                                                        if (weights.length < 1) return null;
                                                        
                                                        const width = 500;
                                                        const height = 250;
                                                        const margin = { top: 20, right: 30, bottom: 50, left: 70 };
                                                        const graphWidth = width - margin.left - margin.right;
                                                        const graphHeight = height - margin.top - margin.bottom;
                                                        
                                                        // Weight chart setup
                                                        const minWeight = Math.min(...weights);
                                                        const maxWeight = Math.max(...weights);
                                                        const weightPadding = (maxWeight - minWeight) * 0.1 || 5;
                                                        const weightChartMin = Math.max(0, minWeight - weightPadding);
                                                        const weightChartMax = maxWeight + weightPadding;
                                                        const weightRange = weightChartMax - weightChartMin;
                                                        
                                                        // Length chart setup
                                                        const hasLengthData = lengths.length >= 1;
                                                        let minLength, maxLength, lengthRange, lengthChartMin, lengthChartMax;
                                                        if (hasLengthData) {
                                                            minLength = Math.min(...lengths);
                                                            maxLength = Math.max(...lengths);
                                                            const lengthPadding = (maxLength - minLength) * 0.1 || 1;
                                                            lengthChartMin = Math.max(0, minLength - lengthPadding);
                                                            lengthChartMax = maxLength + lengthPadding;
                                                            lengthRange = lengthChartMax - lengthChartMin;
                                                        }
                                                        
                                                        // Height chart setup
                                                        const hasHeightData = heights.length >= 1;
                                                        let minHeight, maxHeight, heightRange, heightChartMin, heightChartMax;
                                                        if (hasHeightData) {
                                                            minHeight = Math.min(...heights);
                                                            maxHeight = Math.max(...heights);
                                                            const heightPadding = (maxHeight - minHeight) * 0.1 || 1;
                                                            heightChartMin = Math.max(0, minHeight - heightPadding);
                                                            heightChartMax = maxHeight + heightPadding;
                                                            heightRange = heightChartMax - heightChartMin;
                                                        }
                                                        
                                                        // Create points for weight
                                                        const weightPoints = sorted.map((record, idx) => ({
                                                            x: margin.left + (idx / Math.max(1, sorted.length - 1)) * graphWidth,
                                                            y: margin.top + graphHeight - ((parseFloat(record.weight) - weightChartMin) / weightRange) * graphHeight,
                                                            weight: record.weight,
                                                            length: record.length,
                                                            height: record.height,
                                                            bcs: record.bcs,
                                                            notes: record.notes,
                                                            date: record.date
                                                        }));
                                                        
                                                        // Create points for length
                                                        const lengthPoints = hasLengthData ? sorted.filter(r => r.length).map((record, idx) => ({
                                                            x: margin.left + (sorted.indexOf(record) / Math.max(1, sorted.length - 1)) * graphWidth,
                                                            y: margin.top + graphHeight - ((parseFloat(record.length) - lengthChartMin) / lengthRange) * graphHeight,
                                                            weight: record.weight,
                                                            length: record.length,
                                                            height: record.height,
                                                            bcs: record.bcs,
                                                            notes: record.notes,
                                                            date: record.date
                                                        })) : [];
                                                        
                                                        // Create points for height
                                                        const heightPoints = hasHeightData ? sorted.filter(r => r.height).map((record, idx) => ({
                                                            x: margin.left + (sorted.indexOf(record) / Math.max(1, sorted.length - 1)) * graphWidth,
                                                            y: margin.top + graphHeight - ((parseFloat(record.height) - heightChartMin) / heightRange) * graphHeight,
                                                            weight: record.weight,
                                                            length: record.length,
                                                            height: record.height,
                                                            bcs: record.bcs,
                                                            notes: record.notes,
                                                            date: record.date
                                                        })) : [];
                                                        
                                                        const weightPathData = weightPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                                        const lengthPathData = lengthPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                                        const heightPathData = heightPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                                        
                                                        const getBCSDescription = (bcsValue) => {
                                                            const bcsMap = {
                                                                '1': 'Emaciated',
                                                                '2': 'Thin',
                                                                '3': 'Ideal',
                                                                '4': 'Overweight',
                                                                '5': 'Obese'
                                                            };
                                                            return bcsMap[bcsValue] || bcsValue;
                                                        };
                                                        
                                                        const renderChart = (points, label, color, pathData, chartMin, chartMax) => {
                                                            const range = chartMax - chartMin;
                                                            return (
                                                                <svg key={`chart-${label}`} width="100%" height="300" viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: '100%' }} preserveAspectRatio="xMidYMid meet">
                                                                    {/* Grid lines */}
                                                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                                                        const y = margin.top + graphHeight * (1 - ratio);
                                                                        const axisLabel = (chartMin + range * ratio).toFixed(1);
                                                                        return (
                                                                            <g key={`grid-${i}`}>
                                                                                <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                                                                                <text x={margin.left - 12} y={y} textAnchor="end" dy="0.3em" fontSize="11" fill="#666">{axisLabel}</text>
                                                                            </g>
                                                                        );
                                                                    })}
                                                                    
                                                                    {/* Axes */}
                                                                    <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke={color} strokeWidth="2" />
                                                                    <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#333" strokeWidth="2" />
                                                                    
                                                                    {/* Y-axis label */}
                                                                    <text x={20} y={margin.top + graphHeight / 2} textAnchor="middle" fontSize="12" fill={color} fontWeight="600" transform={`rotate(-90 20 ${margin.top + graphHeight / 2})`}>
                                                                        {label} ({label === 'Weight' ? animalToView.measurementUnits?.weight || 'g' : animalToView.measurementUnits?.length || 'cm'})
                                                                    </text>
                                                                    
                                                                    {/* X-axis label */}
                                                                    <text x={margin.left + graphWidth / 2} y={height - 8} textAnchor="middle" fontSize="12" fill="#333" fontWeight="600">
                                                                        Date
                                                                    </text>
                                                                    
                                                                    {/* X-axis date labels */}
                                                                    {points.map((p, i) => (
                                                                        i % Math.max(1, Math.floor(points.length / 5)) === 0 && (
                                                                            <text key={`date-${i}`} x={p.x} y={height - margin.bottom + 25} textAnchor="middle" fontSize="10" fill="#666">
                                                                                {formatDate(p.date)}
                                                                            </text>
                                                                        )
                                                                    ))}
                                                                    
                                                                    {/* Curve */}
                                                                    <path d={pathData} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    
                                                                    {/* Points */}
                                                                    {points.map((p, i) => {
                                                                        const tooltipText = [
                                                                            `Date: ${formatDate(p.date)}`,
                                                                            `Weight: ${p.weight} ${animalToView.measurementUnits?.weight || 'g'}`,
                                                                            p.length ? `Length: ${p.length} ${animalToView.measurementUnits?.length || 'cm'}` : null,
                                                                            p.bcs ? `BCS: ${p.bcs} - ${getBCSDescription(p.bcs)}` : null,
                                                                            p.notes ? `Notes: ${p.notes}` : null
                                                                        ].filter(Boolean).join('\n');
                                                                        
                                                                        // Color gradient from green (earliest) to red (latest)
                                                                        const colorRatio = points.length > 1 ? i / (points.length - 1) : 0;
                                                                        let dotColor;
                                                                        if (colorRatio < 0.5) {
                                                                            const t = colorRatio * 2;
                                                                            const r = Math.round(144 + (255 - 144) * t);
                                                                            const g = 191;
                                                                            const b = Math.round(71 + (0 - 71) * t);
                                                                            dotColor = `rgb(${r}, ${g}, ${b})`;
                                                                        } else {
                                                                            const t = (colorRatio - 0.5) * 2;
                                                                            const r = 255;
                                                                            const g = Math.round(191 - (191) * t);
                                                                            const b = 0;
                                                                            dotColor = `rgb(${r}, ${g}, ${b})`;
                                                                        }
                                                                        
                                                                        return (
                                                                            <circle key={`point-${i}`} cx={p.x} cy={p.y} r="5" fill={dotColor} stroke="#fff" strokeWidth="2">
                                                                                <title>{tooltipText}</title>
                                                                            </circle>
                                                                        );
                                                                    })}
                                                                </svg>
                                                            );
                                                        };
                                                        
                                                        return (
                                                            <div className="space-y-4">
                                                                {/* Weight Chart */}
                                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                                        <span className="inline-block w-3 h-1 bg-blue-500 rounded"></span>
                                                                        Weight Growth Curve
                                                                    </h3>
                                                                    {renderChart(weightPoints, 'Weight', '#3b82f6', weightPathData, weightChartMin, weightChartMax)}
                                                                    <p className="text-xs text-gray-500 mt-2">Hover over points to see detailed measurements and notes.</p>
                                                                </div>
                                                                
                                                                {/* Length Chart */}
                                                                {hasLengthData && (
                                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                                            <span className="inline-block w-3 h-1 bg-orange-500 rounded"></span>
                                                                            Length Growth Curve
                                                                        </h3>
                                                                        {renderChart(lengthPoints, 'Length', '#ff8c42', lengthPathData, lengthChartMin, lengthChartMax)}
                                                                        <p className="text-xs text-gray-500 mt-2">Hover over points to see detailed measurements and notes.</p>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Height Chart */}
                                                                {hasHeightData && (
                                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                                            <span className="inline-block w-3 h-1 bg-purple-500 rounded"></span>
                                                                            Height at Withers Growth Curve
                                                                        </h3>
                                                                        {renderChart(heightPoints, 'Height', '#9333ea', heightPathData, heightChartMin, heightChartMax)}
                                                                        <p className="text-xs text-gray-500 mt-2">Hover over points to see detailed measurements and notes.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })();
                                                })()}
                                            </div>
                                        )}

                                        {/* Tab 3: Identification */}
                                        {detailViewTab === 3 && (
                                            <div className="space-y-6">
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                    <h3 className="text-lg font-semibold text-gray-700"><Hash size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Identification Numbers</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div><span className="text-gray-600">CritterTrack ID:</span> <strong>{animalToView.id_public || ''}</strong></div>
                                                        <div><span className="text-gray-600">Identification:</span> <strong>{animalToView.breederAssignedId || ''}</strong></div>
                                                        {animalToView.microchipNumber && <div><span className="text-gray-600">Microchip:</span> <strong>{animalToView.microchipNumber}</strong></div>}
                                                        <div><span className="text-gray-600">Pedigree Reg ID:</span> <strong>{animalToView.pedigreeRegistrationId || ''}</strong></div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                    <h3 className="text-lg font-semibold text-gray-700"><FolderOpen size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Classification</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div><span className="text-gray-600">Species:</span> <strong>{animalToView.species}</strong></div>
                                                        <div><span className="text-gray-600">Breed:</span> <strong>{animalToView.breed || ''}</strong></div>
                                                        <div><span className="text-gray-600">Strain:</span> <strong>{animalToView.strain || ''}</strong></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tab 6: Family */}
                                        {detailViewTab === 6 && (
                                            <div className="space-y-6">
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-lg font-semibold text-gray-700"><TreeDeciduous size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Parents</h3>
                                                        <button
                                                            onClick={() => setShowPedigreeChart(true)}
                                                            data-tutorial-target="pedigree-btn"
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-black text-sm font-semibold rounded-lg transition"
                                                        >
                                                            <FileText size={16} />
                                                            Pedigree
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                                                        <ParentCard 
                                                            key={`father-${parentCardKey}`}
                                                            parentId={animalToView.fatherId_public} 
                                                            parentType="Father"
                                                            authToken={authToken}
                                                            API_BASE_URL={API_BASE_URL}
                                                            onViewAnimal={handleViewAnimal}
                                                        />
                                                        <ParentCard 
                                                            key={`mother-${parentCardKey}`}
                                                            parentId={animalToView.motherId_public} 
                                                            parentType="Mother"
                                                            authToken={authToken}
                                                            API_BASE_URL={API_BASE_URL}
                                                            onViewAnimal={handleViewAnimal}
                                                        />
                                                    </div>
                                                </div>
                                                {animalToView.origin && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <span className="text-sm text-gray-600">Origin:</span> <strong>{animalToView.origin}</strong>
                                                    </div>
                                                )}

                                                {/* Breeding Records - Accordion View (Nested) */}
                                                {animalToView.breedingRecords && animalToView.breedingRecords.length > 0 && (
                                                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-3">
                                                        <h3 className="text-lg font-semibold text-gray-700 flex items-center"><BarChart2 size={18} className="inline-block align-middle text-purple-600 mr-2 flex-shrink-0" />Breeding Records</h3>
                                                        <div className="space-y-2">
                                                            {animalToView.breedingRecords.map((record, idx) => {
                                                                const isExpanded = expandedBreedingRecords[idx];
                                                                const countSummary = [
                                                                    record.litterSizeBorn !== null && `${record.litterSizeBorn} born`,
                                                                    record.stillbornCount && `${record.stillbornCount} stillborn`,
                                                                    record.litterSizeWeaned !== null && `${record.litterSizeWeaned} weaned`
                                                                ].filter(Boolean).join(' � ') || 'No counts';
                                                                return (
                                                                    <div key={idx} className={`bg-white rounded border transition-all ${isExpanded ? 'border-purple-300 shadow-md' : 'border-purple-100'}`}>
                                                                        <div 
                                                                            onClick={() => setExpandedBreedingRecords({...expandedBreedingRecords, [idx]: !isExpanded})}
                                                                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-purple-50 transition rounded"
                                                                        >
                                                                            <div className="flex items-center gap-3 flex-1">
                                                                                <ChevronRight size={18} className={`inline-block align-middle transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                                                {record.litterName ? (
                                                                                    <>
                                                                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-700 text-white flex-shrink-0">{record.litterName}</span>
                                                                                        {record.litterId && <span className="text-xs font-mono text-gray-400 flex-shrink-0">{record.litterId}</span>}
                                                                                    </>
                                                                                ) : record.litterId ? (
                                                                                    <span className="font-mono px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 bg-purple-300 text-purple-800">{record.litterId}</span>
                                                                                ) : null}
                                                                                <div className="text-sm text-gray-700 flex items-center gap-2 flex-wrap">
                                                                                    {record.birthEventDate && <><span>{formatDate(record.birthEventDate)}</span><span className="text-gray-400">&bull;</span></>}
                                                                                    {!record.birthEventDate && formatDate(record.matingDate) && <><span>{formatDate(record.matingDate)}</span><span className="text-gray-400">&bull;</span></>}
                                                                                    {record.mate && <><span>{record.mate}</span><span className="text-gray-400">&bull;</span></>}
                                                                                    <span className="text-purple-700 font-medium">{countSummary}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        {isExpanded && (
                                                                            <div className="border-t border-purple-100 p-4 bg-purple-50 space-y-4">
                                                                                {/* CTL ID + Litter Name */}
                                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                                                    <div><div className="text-gray-600 text-xs">CTL ID</div><div className="font-mono text-xs font-semibold text-gray-700">{record.litterId || 'Not Linked'}</div></div>
                                                                                    {record.litterName && <div><div className="text-gray-600 text-xs">Litter Name</div><div className="font-semibold text-purple-800">{record.litterName}</div></div>}
                                                                                </div>
                                                                                {/* Mate, Dates, Method, Condition, Outcome */}
                                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                                                    {record.mate && (<div><div className="text-gray-600 text-xs">Mate / Other Parent</div><div className="font-semibold text-gray-800">{record.mate}</div></div>)}
                                                                                    <div><div className="text-gray-600 text-xs">Mating Date</div><div className="font-semibold text-gray-800">{formatDate(record.matingDate) || '?'}</div></div>
                                                                                    {record.breedingMethod && (<div><div className="text-gray-600 text-xs">Breeding Method</div><div className="font-semibold text-gray-800">{record.breedingMethod}</div></div>)}
                                                                                    {record.breedingConditionAtTime && (<div><div className="text-gray-600 text-xs">Breeding Condition</div><div className="font-semibold text-gray-800">{record.breedingConditionAtTime}</div></div>)}
                                                                                    {record.outcome && (<div><div className="text-gray-600 text-xs">Outcome</div><div className={`font-semibold ${record.outcome === 'Successful' ? 'text-green-600' : record.outcome === 'Unsuccessful' ? 'text-red-600' : 'text-gray-600'}`}>{record.outcome}</div></div>)}
                                                                                    {record.birthEventDate && (<div><div className="text-gray-600 text-xs">Birth Date</div><div className="font-semibold text-gray-800">{formatDate(record.birthEventDate) || '?'}</div></div>)}
                                                                                    {record.birthMethod && (<div><div className="text-gray-600 text-xs">Birth Method</div><div className="font-semibold text-gray-800">{record.birthMethod}</div></div>)}
                                                                                </div>
                                                                                {/* Notes */}
                                                                                {record.notes && (<div className="bg-white p-3 rounded border border-purple-100"><div className="text-sm font-semibold text-gray-700 mb-2">Notes</div><div className="text-sm text-gray-700 italic">{record.notes}</div></div>)}
                                                                                {/* Offspring Counts */}
                                                                                <div className="bg-white p-3 rounded border border-purple-100">
                                                                                    <div className="text-sm font-semibold text-gray-700 mb-3">Offspring Counts</div>
                                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                                                        <div><div className="text-gray-600 text-xs">Total Born</div><div className="text-2xl font-bold text-purple-600">{record.litterSizeBorn !== null ? record.litterSizeBorn : '?'}</div></div>
                                                                                        <div><div className="text-gray-600 text-xs">Stillborn</div><div className="text-2xl font-bold text-gray-600">{record.stillbornCount || '0'}</div></div>
                                                                                        <div><div className="text-gray-600 text-xs">Weaned</div><div className="text-2xl font-bold text-green-600">{record.litterSizeWeaned !== null ? record.litterSizeWeaned : '?'}</div></div>
                                                                                        {breedingRecordLitters?.[record.litterId]?.maleCount != null && <div><div className="text-gray-600 text-xs">Males</div><div className="text-2xl font-bold text-blue-500">{breedingRecordLitters[record.litterId].maleCount}</div></div>}
                                                                                        {breedingRecordLitters?.[record.litterId]?.femaleCount != null && <div><div className="text-gray-600 text-xs">Females</div><div className="text-2xl font-bold text-pink-500">{breedingRecordLitters[record.litterId].femaleCount}</div></div>}
                                                                                        {breedingRecordLitters?.[record.litterId]?.unknownCount != null && breedingRecordLitters[record.litterId].unknownCount > 0 && <div><div className="text-gray-600 text-xs">Unknown / Intersex</div><div className="text-2xl font-bold text-gray-600">{breedingRecordLitters[record.litterId].unknownCount}</div></div>}
                                                                                        {breedingRecordLitters?.[record.litterId]?.inbreedingCoefficient != null && <div><div className="text-gray-600 text-xs">COI</div><div className="text-xl font-bold text-gray-700">{breedingRecordLitters[record.litterId].inbreedingCoefficient.toFixed(2)}%</div></div>}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                <OffspringSection
                                                    animalId={animalToView.id_public}
                                                    API_BASE_URL={API_BASE_URL}
                                                    authToken={authToken}
                                                    onViewAnimal={handleViewAnimal}
                                                />
                                            </div>
                                        )}                    {/* Tab 7: Fertility */}
                    {detailViewTab === 7 && (
                        <div className="space-y-6">
                            {/* 1st Section: Reproductive Status */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Leaf size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Reproductive Status</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Neutered/Spayed:</span> <strong>{animalToView.isNeutered ? 'Yes' : 'No'}</strong></div>
                                    <div><span className="text-gray-600">Infertile:</span> <strong>{animalToView.isInfertile ? 'Yes' : 'No'}</strong></div>
                                    {!animalToView.isNeutered && !animalToView.isInfertile && (
                                        <div><span className="text-gray-600">In Mating:</span> <strong>{animalToView.isInMating ? 'Yes' : 'No'}</strong></div>
                                    )}
                                    {(animalToView.gender === 'Female' || animalToView.gender === 'Intersex' || animalToView.gender === 'Unknown') && !animalToView.isNeutered && (
                                        <>
                                            <div><span className="text-gray-600">Pregnant:</span> <strong>{animalToView.isPregnant ? 'Yes' : 'No'}</strong></div>
                                            <div><span className="text-gray-600">Nursing:</span> <strong>{animalToView.isNursing ? 'Yes' : 'No'}</strong></div>
                                        </>
                                    )}
                                    {animalToView.gender === 'Male' && !animalToView.isNeutered && !animalToView.isInfertile && (
                                        <div><span className="text-gray-600">Stud Animal:</span> <strong>{animalToView.isStudAnimal ? 'Yes' : 'No'}</strong></div>
                                    )}
                                    {animalToView.gender === 'Female' && !animalToView.isNeutered && !animalToView.isInfertile && (
                                        <div><span className="text-gray-600">Breeding Dam:</span> <strong>{animalToView.isDamAnimal ? 'Yes' : 'No'}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* 2nd Section: Estrus/Cycle (Female/Intersex/Unknown only) */}
                            {(animalToView.gender === 'Female' || animalToView.gender === 'Intersex' || animalToView.gender === 'Unknown') && !animalToView.isNeutered && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><RefreshCw size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Estrus/Cycle</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Heat Status:</span> <strong>{animalToView.heatStatus || ''}</strong></div>
                                        <div><span className="text-gray-600">Last Heat Date:</span> <strong>{animalToView.lastHeatDate ? formatDate(animalToView.lastHeatDate) : ''}</strong></div>
                                        <div><span className="text-gray-600">Ovulation Date:</span> <strong>{animalToView.ovulationDate ? formatDate(animalToView.ovulationDate) : ''}</strong></div>
                                        {(animalToView.species === 'Dog' || animalToView.species === 'Cat') && (
                                            <div><span className="text-gray-600">Estrus Cycle Length:</span> <strong>{animalToView.estrusCycleLength ? `${animalToView.estrusCycleLength} days` : ''}</strong></div>
                                        )}
                                    </div>
                                </div>
                            )}


                            {/* 4th Section: Stud Information */}
                            {!animalToView.isNeutered && !animalToView.isInfertile && (animalToView.gender === 'Male' || animalToView.gender === 'Intersex' || animalToView.gender === 'Unknown') && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Mars size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Sire Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Fertility Status:</span> <strong>{animalToView.fertilityStatus || ''}</strong></div>
                                    </div>
                                    {animalToView.fertilityNotes && (
                                        <div className="text-sm"><span className="text-gray-600">Notes:</span> <strong className="whitespace-pre-wrap">{animalToView.fertilityNotes}</strong></div>
                                    )}
                                    {(animalToView.species === 'Dog' || animalToView.species === 'Cat') && (
                                        <>
                                            {animalToView.reproductiveClearances && (
                                                <div className="text-sm"><span className="text-gray-600">Reproductive Clearances:</span> <strong className="whitespace-pre-wrap">{animalToView.reproductiveClearances}</strong></div>
                                            )}
                                            {animalToView.reproductiveComplications && (
                                                <div className="text-sm"><span className="text-gray-600">Reproductive Complications:</span> <strong className="whitespace-pre-wrap">{animalToView.reproductiveComplications}</strong></div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 5th Section: Dam Information */}
                            {!animalToView.isNeutered && !animalToView.isInfertile && (animalToView.gender === 'Female' || animalToView.gender === 'Intersex' || animalToView.gender === 'Unknown') && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Venus size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Dam Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-gray-600">Dam Fertility Status:</span> <strong>{animalToView.damFertilityStatus || animalToView.fertilityStatus || ''}</strong></div>
                                        {(animalToView.species === 'Dog' || animalToView.species === 'Cat') && (
                                            <>
                                                <div><span className="text-gray-600">Gestation Length:</span> <strong>{animalToView.gestationLength ? `${animalToView.gestationLength} days` : ''}</strong></div>
                                                <div><span className="text-gray-600">Delivery Method:</span> <strong>{animalToView.deliveryMethod || ''}</strong></div>
                                                {animalToView.species === 'Dog' && animalToView.whelpingDate && (
                                                    <div><span className="text-gray-600">Whelping Date:</span> <strong>{formatDate(animalToView.whelpingDate)}</strong></div>
                                                )}
                                                {animalToView.species === 'Cat' && animalToView.queeningDate && (
                                                    <div><span className="text-gray-600">Queening Date:</span> <strong>{formatDate(animalToView.queeningDate)}</strong></div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    {animalToView.damFertilityNotes && (
                                        <div className="text-sm"><span className="text-gray-600">Notes:</span> <strong className="whitespace-pre-wrap">{animalToView.damFertilityNotes}</strong></div>
                                    )}
                                    {(animalToView.species === 'Dog' || animalToView.species === 'Cat') && (
                                        <>
                                            {animalToView.reproductiveClearances && (
                                                <div className="text-sm"><span className="text-gray-600">Reproductive Clearances:</span> <strong className="whitespace-pre-wrap">{animalToView.reproductiveClearances}</strong></div>
                                            )}
                                            {animalToView.reproductiveComplications && (
                                                <div className="text-sm"><span className="text-gray-600">Reproductive Complications:</span> <strong className="whitespace-pre-wrap">{animalToView.reproductiveComplications}</strong></div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* 6th Section: Litter Records */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center"><span className="text-blue-600 mr-2">??</span>Litter Records</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {(animalToView.gender === 'Male' || animalToView.gender === 'Intersex' || animalToView.gender === 'Unknown') && (
                                        <>
                                            <div><span className="text-gray-600">Last Mating Date:</span> <strong>{animalToView.lastMatingDate ? formatDate(animalToView.lastMatingDate) : ''}</strong></div>
                                            </>
                                    )}
                                    {(animalToView.gender === 'Female' || animalToView.gender === 'Intersex' || animalToView.gender === 'Unknown') && (
                                        <>
                                            <div><span className="text-gray-600">Last Pregnancy Date:</span> <strong>{animalToView.lastPregnancyDate ? formatDate(animalToView.lastPregnancyDate) : ''}</strong></div>
                                            <div><span className="text-gray-600">Litter Count:</span> <strong>{animalToView.litterCount || ''}</strong></div>
                                        </>
                                    )}
                                    <div><span className="text-gray-600">Total Offspring:</span> <strong>{animalToView.offspringCount || ''}</strong></div>
                                </div>
                            </div>
                        </div>
                    )}

                                        {/* Tab 8: Health */}
                                        {detailViewTab === 8 && (
                                            <div className="space-y-6">
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700">Health Records</h3>
                                                        {animalToView.vaccinations && (
                                                            <div>
                                                                <strong>Vaccinations:</strong>
                                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                                    {(() => {
                                                                        const data = animalToView.vaccinations;
                                                                        const parsed = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return []; } })() : Array.isArray(data) ? data : [];
                                                                        return parsed.map((vacc, idx) => (
                                                                            <li key={idx} className="text-gray-700">
                                                                                {vacc.name} {vacc.date && `(${formatDate(vacc.date)})`}
                                                                                {vacc.notes && <span className="text-gray-600"> - {vacc.notes}</span>}
                                                                            </li>
                                                                        ));
                                                                    })()}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {animalToView.dewormingRecords && (
                                                            <div>
                                                                <strong>Deworming:</strong>
                                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                                    {(() => {
                                                                        const data = animalToView.dewormingRecords;
                                                                        const parsed = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return []; } })() : Array.isArray(data) ? data : [];
                                                                        return parsed.map((record, idx) => (
                                                                            <li key={idx} className="text-gray-700">
                                                                                {record.medication} {record.date && `(${formatDate(record.date)})`}
                                                                                {record.notes && <span className="text-gray-600"> - {record.notes}</span>}
                                                                            </li>
                                                                        ));
                                                                    })()}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {animalToView.parasiteControl && (
                                                            <div>
                                                                <strong>Parasite Control:</strong>
                                                                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                                    {(() => {
                                                                        const data = animalToView.parasiteControl;
                                                                        const parsed = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return []; } })() : Array.isArray(data) ? data : [];
                                                                        return parsed.map((record, idx) => (
                                                                            <li key={idx} className="text-gray-700">
                                                                                {record.treatment} {record.date && `(${formatDate(record.date)})`}
                                                                                {record.notes && <span className="text-gray-600"> - {record.notes}</span>}
                                                                            </li>
                                                                        ));
                                                                    })()}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {animalToView.primaryVet && <div><strong>Primary Vet:</strong> <p className="text-sm mt-1">{animalToView.primaryVet}</p></div>}
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700">Medical Information</h3>
                                                        {animalToView.medicalConditions && (() => {
                                                            const parsed = parseHealthRecords(animalToView.medicalConditions);
                                                            return parsed && parsed.length > 0 ? (
                                                                <div>
                                                                    <strong>Medical Conditions:</strong>
                                                                    <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                                        {parsed.map((condition, idx) => (
                                                                            <li key={idx} className="text-gray-700">
                                                                                {condition.condition || condition.name}
                                                                                {condition.notes && <span className="text-gray-600"> - {condition.notes}</span>}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            ) : null;
                                                        })()}
                                                        {animalToView.allergies && (() => {
                                                            const parsed = parseHealthRecords(animalToView.allergies);
                                                            return parsed && parsed.length > 0 ? (
                                                                <div>
                                                                    <strong>Allergies:</strong>
                                                                    <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                                        {parsed.map((allergy, idx) => (
                                                                            <li key={idx} className="text-gray-700">
                                                                                {allergy.allergen || allergy.name}
                                                                                {allergy.notes && <span className="text-gray-600"> - {allergy.notes}</span>}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            ) : null;
                                                        })()}
                                                        {animalToView.medications && (() => {
                                                            const parsed = parseHealthRecords(animalToView.medications);
                                                            return parsed && parsed.length > 0 ? (
                                                                <div>
                                                                    <strong>Medications:</strong>
                                                                    <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                                                                        {parsed.map((med, idx) => (
                                                                            <li key={idx} className="text-gray-700">
                                                                                {med.medication || med.name}
                                                                                {med.notes && <span className="text-gray-600"> - {med.notes}</span>}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                            </div>
                                        )}

                                        {/* Tab 9: Care */}
                                        {detailViewTab === 9 && (
                                            <div className="space-y-6">
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700"><UtensilsCrossed size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Nutrition</h3>
                                                        {animalToView.dietType && <div><strong>Diet Type:</strong> <p className="text-sm mt-1">{animalToView.dietType}</p></div>}
                                                        {animalToView.feedingSchedule && <div><strong>Feeding Schedule:</strong> <p className="text-sm mt-1">{animalToView.feedingSchedule}</p></div>}
                                                        {animalToView.supplements && <div><strong>Supplements:</strong> <p className="text-sm mt-1">{animalToView.supplements}</p></div>}
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700"><Droplets size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Animal Care</h3>
                                                        {animalToView.housingType && <div><strong>Housing Type:</strong> <p className="text-sm mt-1">{animalToView.housingType}</p></div>}
                                                        {animalToView.bedding && <div><strong>Bedding:</strong> <p className="text-sm mt-1">{animalToView.bedding}</p></div>}
                                                        {animalToView.enrichment && <div><strong>Enrichment:</strong> <p className="text-sm mt-1">{animalToView.enrichment}</p></div>}
                                                    </div>
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700"><Thermometer size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Environment</h3>
                                                        {animalToView.temperatureRange && <div><strong>Temperature Range:</strong> <p className="text-sm mt-1">{animalToView.temperatureRange}</p></div>}
                                                        {animalToView.humidity && <div><strong>Humidity:</strong> <p className="text-sm mt-1">{animalToView.humidity}</p></div>}
                                                        {animalToView.lighting && <div><strong>Lighting:</strong> <p className="text-sm mt-1">{animalToView.lighting}</p></div>}
                                                        {animalToView.noise && <div><strong>Noise Level:</strong> <p className="text-sm mt-1">{animalToView.noise}</p></div>}
                                                    </div>
                                            </div>
                                        )}

                                        {/* Tab 10: Behavior */}
                                        {detailViewTab === 10 && (
                                            <div className="space-y-6">
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <h3 className="text-lg font-semibold text-gray-700">Behavior & Welfare</h3>
                                                        {animalToView.temperament && <div><strong>Temperament:</strong> <p className="text-sm mt-1">{animalToView.temperament}</p></div>}
                                                        {animalToView.handlingTolerance && <div><strong>Handling Tolerance:</strong> <p className="text-sm mt-1">{animalToView.handlingTolerance}</p></div>}
                                                        {animalToView.socialStructure && <div><strong>Social Structure:</strong> <p className="text-sm mt-1">{animalToView.socialStructure}</p></div>}
                                                        {animalToView.activityCycle && <div><strong>Activity Cycle:</strong> <p className="text-sm mt-1">{animalToView.activityCycle}</p></div>}
                                                    </div>
                                            </div>
                                        )}

                                        {/* Tab 11: Notes */}
                                        {detailViewTab === 11 && (
                                            <div className="space-y-6">
                                                {animalToView.remarks && (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Remarks / Notes</h3>
                                                        <p className="text-sm">{animalToView.remarks}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}                    {/* Tab 14: End of Life */}
                    {detailViewTab === 14 && (
                        <div className="space-y-6">
                            {/* 1st Section: End of Life */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Feather size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Deceased Date:</span> <strong>{animalToView.deceasedDate ? formatDate(animalToView.deceasedDate) : ''}</strong></div>
                                    <div><span className="text-gray-600">Cause of Death:</span> <strong>{animalToView.causeOfDeath || ''}</strong></div>
                                    <div><span className="text-gray-600">Necropsy Results:</span> <strong>{animalToView.necropsyResults || ''}</strong></div>
                                    {animalToView.endOfLifeCareNotes && (
                                        <div><span className="text-gray-600">End of Life Care Notes:</span> <strong className="whitespace-pre-wrap">{animalToView.endOfLifeCareNotes}</strong></div>
                                    )}
                                </div>
                            </div>

                            {/* 2nd Section: Legal/Administrative */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2"><ClipboardList size={18} className="flex-shrink-0" /> Legal/Administrative</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div><span className="text-gray-600">Insurance:</span> <strong>{animalToView.insurance || ''}</strong></div>
                                    <div><span className="text-gray-600">Legal Status:</span> <strong>{animalToView.legalStatus || ''}</strong></div>
                                </div>
                            </div>

                            {/* 3rd Section: Restrictions (Dog/Cat only) */}
                            {(animalToView.species === 'Dog' || animalToView.species === 'Cat') && (animalToView.breedingRestrictions || animalToView.exportRestrictions) && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Ban size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Restrictions</h3>
                                    <div className="space-y-3 text-sm">
                                        {animalToView.breedingRestrictions && (
                                            <div><span className="text-gray-600">Breeding Restrictions:</span> <strong className="whitespace-pre-wrap">{animalToView.breedingRestrictions}</strong></div>
                                        )}
                                        {animalToView.exportRestrictions && (
                                            <div><span className="text-gray-600">Export Restrictions:</span> <strong className="whitespace-pre-wrap">{animalToView.exportRestrictions}</strong></div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 12: Show */}
                    {detailViewTab === 12 && (
                        <div className="space-y-6">
                            {/* Show Titles & Ratings */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-700"><Medal size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Show Titles & Ratings</h3>
                                <div className="space-y-3 text-sm">
                                    <div><span className="text-gray-600">Titles:</span> <strong>{animalToView.showTitles || ''}</strong></div>
                                    <div><span className="text-gray-600">Ratings:</span> <strong>{animalToView.showRatings || ''}</strong></div>
                                    <div><span className="text-gray-600">Judge Comments:</span> <strong className="whitespace-pre-wrap">{animalToView.judgeComments || ''}</strong></div>
                                </div>
                            </div>

                            {/* Working Titles & Performance - Dog only */}
                            {animalToView.species === 'Dog' && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700"><Target size={16} className="inline-block align-middle mr-1 flex-shrink-0" /> Working & Performance</h3>
                                    <div className="space-y-3 text-sm">
                                        <div><span className="text-gray-600">Working Titles:</span> <strong>{animalToView.workingTitles || ''}</strong></div>
                                        <div><span className="text-gray-600">Performance Scores:</span> <strong>{animalToView.performanceScores || ''}</strong></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                                    {/* Pedigree Chart Modal */}
                                    {showPedigreeChart && animalToView && (
                                        <PedigreeChart
                                            animalData={animalToView}
                                            onClose={() => setShowPedigreeChart(false)}
                                            API_BASE_URL={API_BASE_URL}
                                            authToken={authToken}
                                            onViewAnimal={handleViewAnimal}
                                        />
                                    )}
                                        </div>
                                    </div>
                                </>
                            );
                        })()
                    )
                } />

                </Routes>
            </main>

            <footer className="w-full mt-6 text-center text-sm pt-4 border-t border-gray-200 max-w-5xl">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-2">
                    <button
                        onClick={() => setShowBugReportModal(true)}
                        className="text-gray-600 hover:text-primary transition font-medium flex items-center gap-1"
                    >
                        <AlertCircle size={14} />
                        Report Issue / Bug
                    </button>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <button
                        onClick={() => setShowTermsModal(true)}
                        className="text-gray-600 hover:text-primary transition"
                    >
                        Terms of Service
                    </button>
                    <span className="hidden sm:inline text-gray-300">|</span>
                    <button
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-gray-600 hover:text-primary transition"
                    >
                        Privacy Policy
                    </button>
                </div>
                <p className="text-gray-500">&copy; {new Date().getFullYear()} CritterTrack Pedigree System.</p>
            </footer>
            
            {showTermsModal && <TermsOfService onClose={() => setShowTermsModal(false)} />}
            {showPrivacyModal && <PrivacyPolicy onClose={() => setShowPrivacyModal(false)} />}
            
            {/* Transfer Animal Modal */}
            {showTransferModal && transferAnimal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <ArrowLeftRight size={24} className="text-blue-600" />
                                Transfer Animal
                            </h2>
                            <button
                                onClick={() => {
                                    setShowTransferModal(false);
                                    setTransferAnimal(null);
                                    setTransferUserQuery('');
                                    setTransferUserResults([]);
                                    setTransferSelectedUser(null);
                                    setTransferSearchPerformed(false);
                                    setTransferPrice('');
                                    setTransferNotes('');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Animal Info */}
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Transferring:</p>
                                <p className="font-semibold text-gray-800">{transferAnimal.id_public} - {transferAnimal.name}</p>
                            </div>

                            {/* Buyer Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search for Buyer *
                                </label>
                                {transferSelectedUser ? (
                                    <div className="flex items-center justify-between p-2 border border-gray-300 rounded-lg bg-gray-50">
                                        <span className="text-gray-700">
                                            {transferSelectedUser.breederName || transferSelectedUser.personalName}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setTransferSelectedUser(null);
                                                setTransferUserResults([]);
                                            }}
                                            className="text-gray-500 hover:text-red-500"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={transferUserQuery}
                                                onChange={(e) => {
                                                    setTransferUserQuery(e.target.value);
                                                    setTransferSearchPerformed(false);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSearchTransferUser();
                                                    }
                                                }}
                                                placeholder="Search by name or ID (min 2 chars)..."
                                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                            />
                                            <button
                                                onClick={handleSearchTransferUser}
                                                disabled={transferSearching}
                                                className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                <Search className="w-4 h-4" />
                                                {transferSearching ? 'Searching...' : 'Search'}
                                            </button>
                                        </div>
                                        {transferUserQuery.length >= 2 && transferUserResults.length > 0 && (
                                            <div className="mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {transferUserResults.map(user => {
                                                    const hasVisibleBreederName = user.breederName && user.showBreederName;
                                                    const hasVisiblePersonalName = user.personalName && user.showPersonalName;
                                                    
                                                    let displayName;
                                                    if (hasVisibleBreederName && hasVisiblePersonalName) {
                                                        displayName = `${user.personalName} (${user.breederName})`;
                                                    } else if (hasVisibleBreederName) {
                                                        displayName = user.breederName;
                                                    } else {
                                                        displayName = user.personalName;
                                                    }
                                                    
                                                    return (
                                                        <button
                                                            key={user.id_public}
                                                            onClick={() => {
                                                                setTransferSelectedUser(user);
                                                                setTransferUserQuery('');
                                                                setTransferUserResults([]);
                                                            }}
                                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="font-medium">{user.id_public}</div>
                                                            <div className="text-sm text-gray-600">{displayName}</div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {transferSearchPerformed && transferUserResults.length === 0 && !transferSearching && (
                                            <div className="mt-1 p-4 bg-white border border-gray-300 rounded-lg text-center text-gray-500 text-sm">
                                                No users found
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sale Price * ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={transferPrice}
                                    onChange={(e) => setTransferPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    value={transferNotes}
                                    onChange={(e) => setTransferNotes(e.target.value)}
                                    placeholder="Add any additional notes..."
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                />
                            </div>

                            {/* Info Box */}
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-xs text-blue-800">
                                        <p className="font-semibold mb-1 flex items-center gap-1"><Info size={14} className="flex-shrink-0" /> How Transfer Works</p>
                                        <p>The buyer will receive a notification to accept the transfer. Once accepted, the animal will be transferred to their account and you'll keep view-only access to track lineage.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSubmitTransfer}
                                    disabled={!transferSelectedUser || !transferPrice}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition disabled:cursor-not-allowed"
                                >
                                    Send Transfer Request
                                </button>
                                <button
                                    onClick={() => {
                                        setShowTransferModal(false);
                                        setTransferAnimal(null);
                                        setTransferUserQuery('');
                                        setTransferUserResults([]);
                                        setTransferSelectedUser(null);
                                        setTransferSearchPerformed(false);
                                        setTransferPrice('');
                                        setTransferNotes('');
                                    }}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {showImageModal && enlargedImageUrl && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[90] p-4"
                    onClick={() => setShowImageModal(false)}
                >
                    <div className="relative max-w-7xl max-h-full flex flex-col items-center gap-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowImageModal(false);
                            }}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                handleImageDownload(enlargedImageUrl);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
                        >
                            <Download size={20} />
                            Download Image
                        </button>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

// ==================== PRIVATE ANIMAL SCREEN ====================
// Shown when trying to view a private animal that doesn't have public access
const PrivateAnimalScreen = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                <Lock size={64} className="text-gray-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">This Animal is Private</h1>
                <p className="text-gray-600 mb-6">
                    This animal doesn't have a public profile available. The owner has not shared this animal publicly.
                </p>
                <button
                    onClick={onBack}
                    className="w-full px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

// Public Animal Page Component
const PublicAnimalPage = () => {
    const { animalId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [animal, setAnimal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [modCurrentContext, setModCurrentContext] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);

    // Check if user is in moderator mode
    const authToken = localStorage.getItem('authToken');
    const inModeratorMode = localStorage.getItem('moderationAuthenticated') === 'true';

    // Determine where to go back to
    const handleGoBack = () => {
        // Check if there's a referrer in location state
        if (location.state?.from) {
            navigate(location.state.from);
        } else {
            // Default to home
            navigate('/');
        }
    };

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

    useEffect(() => {
        const fetchAnimal = async () => {
            try {
                // First try to fetch from public animals
                const response = await axios.get(`${API_BASE_URL}/public/global/animals?id_public=${animalId}`);
                if (response.data?.[0]) {
                    setAnimal(response.data[0]);
                    setLoading(false);
                    return;
                }
                
                // If not found in public, try to fetch from private to determine if it's private or truly not found
                if (authToken) {
                    try {
                        const privateResponse = await axios.get(
                            `${API_BASE_URL}/animals/${animalId}`,
                            { headers: { Authorization: `Bearer ${authToken}` } }
                        );
                        if (privateResponse.data) {
                            // Animal exists but is private
                            setIsPrivate(true);
                            setLoading(false);
                            return;
                        }
                    } catch (error) {
                        // Not found in private either, it's truly not found
                    }
                }
                
                // Truly not found
                setNotFound(true);
                setLoading(false);
            } catch (error) {
                console.error('Animal not found or not public:', error);
                setNotFound(true);
                setLoading(false);
            }
        };
        fetchAnimal();
    }, [animalId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-page-bg flex items-center justify-center p-6">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (isPrivate) {
        return (
            <div className="min-h-screen bg-page-bg flex flex-col items-center p-6">
                <header className="w-full max-w-5xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                    <CustomAppLogo size="w-10 h-10" />
                    <button
                        onClick={handleGoBack}
                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                    >
                        Home
                    </button>
                </header>
                <PrivateAnimalScreen onBack={handleGoBack} />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Animal Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        This animal either doesn't exist or is not publicly visible.
                    </p>
                    <button
                        onClick={handleGoBack}
                        className="w-full px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
                    >
                        Login / Register
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-page-bg flex flex-col items-center p-6">
            <header className="w-full max-w-5xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                <CustomAppLogo size="w-10 h-10" />
                <button
                    onClick={handleGoBack}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                    Home
                </button>
            </header>
            <ViewOnlyAnimalDetail
                animal={animal}
                onClose={handleGoBack}
                onCloseAll={handleGoBack}
                API_BASE_URL={API_BASE_URL}
                authToken={authToken}
                onViewProfile={(user) => navigate(`/user/${user.id_public}`)}
                onViewAnimal={(animal) => navigate(`/animal/${animal.id_public}`)}
                setModCurrentContext={setModCurrentContext}
                setShowImageModal={setShowImageModal}
                setEnlargedImageUrl={setEnlargedImageUrl}
            />
            
            {/* Image Modal */}
            {showImageModal && enlargedImageUrl && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[90] p-4"
                    onClick={() => setShowImageModal(false)}
                >
                    <div className="relative max-w-7xl max-h-full flex flex-col items-center gap-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowImageModal(false);
                            }}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                handleImageDownload(enlargedImageUrl);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
                        >
                            <Download size={20} />
                            Download Image
                        </button>
                    </div>
                </div>
            )}
            
            {/* Moderator Action Sidebar - disabled, use mod panel instead */}
            {false && inModeratorMode && (
                <ModeratorActionSidebar
                    isActive={true}
                    onOpenReportQueue={() => navigate('/')}
                    onQuickFlag={(flagData) => {
                        console.log('Quick flag from animal page:', flagData);
                    }}
                    onExitModeration={() => {
                        localStorage.removeItem('moderationAuthenticated');
                        navigate('/');
                    }}
                    currentPage={location.pathname}
                    currentContext={modCurrentContext}
                />
            )}
        </div>
    );
};

// Public Profile Page Component
const PublicProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '' });

    // Check if user is logged in and in moderator mode
    const authToken = localStorage.getItem('authToken');
    const inModeratorMode = localStorage.getItem('moderationAuthenticated') === 'true';
    const [userProfile, setUserProfile] = useState(null);
    const [modCurrentContext, setModCurrentContext] = useState(null);

    const showModalMessage = (title, message) => {
        setModalContent({ title, message });
        setShowModal(true);
    };

    const handleModQuickFlag = useCallback(async (flagData) => {
        console.log('[MOD ACTION] HANDLER CALLED with:', flagData);
        try {
            console.log('[MOD ACTION] Inside try block');
            console.log('[MOD ACTION] Starting action:', flagData);
            console.log('[MOD ACTION] API_BASE_URL:', API_BASE_URL);
            console.log('[MOD ACTION] authToken:', authToken ? 'present' : 'MISSING');

            // Handle different action types
            if (flagData.action === 'flag') {
                // Create a report for flagged content
                const reportType = flagData.context?.type === 'profile' ? 'profile' : 
                                  flagData.context?.type === 'animal' ? 'animal' : 'message';
                
                // Get the correct user ID based on context type
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                const reportData = {
                    reason: flagData.reason,
                    category: flagData.category,
                    description: `Moderator flag: ${flagData.reason}`,
                    reportedContentId: flagData.context?.id,
                    reportedUserId: userId,
                    isModeratorReport: true
                };

                console.log('[MOD ACTION FLAG] Submitting flag:', { reportType, reportData });

                const response = await axios.post(
                    `${API_BASE_URL}/reports/${reportType}`,
                    reportData,
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION FLAG] Success:', response.data);
                showModalMessage('Flag Submitted', 'Content has been flagged and added to the report queue.');
            } 
            else if (flagData.action === 'edit') {
                // Edit/redact content fields
                const contentType = flagData.context?.type;
                const contentId = flagData.context?.id;
                
                console.log('[MOD ACTION EDIT] Submitting edit:', { contentType, contentId, fieldEdits: flagData.fieldEdits });
                
                const response = await axios.patch(
                    `${API_BASE_URL}/moderation/content/${contentType}/${contentId}/edit`,
                    {
                        fieldEdits: flagData.fieldEdits,
                        reason: flagData.reason
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION EDIT] Success:', response.data);
                showModalMessage('Content Edited', 'Content has been updated successfully.');
                // Refresh the current view
                window.location.reload();
            }
            else if (flagData.action === 'warn') {
                // Warn user - get correct user ID based on context type
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                console.log('[MOD ACTION WARN] Warning user:', { userId, reason: flagData.reason, category: flagData.category });
                
                const response = await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/warn`,
                    {
                        reason: flagData.reason,
                        category: flagData.category
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION WARN] Success:', response.data);
                showModalMessage('Warning Sent', `User has been warned. Total warnings: ${response.data.warningCount}`);
            }
            else if (flagData.action === 'suspend') {
                // Suspend user - get correct user ID based on context type
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                console.log('[MOD ACTION SUSPEND] Suspending user:', { userId, reason: flagData.reason, durationDays: flagData.durationDays });
                
                const response = await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/status`,
                    {
                        status: 'suspended',
                        reason: flagData.reason,
                        durationDays: flagData.durationDays
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION SUSPEND] Success:', response.data);
                showModalMessage('User Suspended', `User has been suspended for ${flagData.durationDays} days.`);
            }
            else if (flagData.action === 'ban') {
                // Ban user - get correct user ID based on context type
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                console.log('[MOD ACTION BAN] Banning user:', { userId, reason: flagData.reason, ipBan: flagData.ipBan });
                
                const response = await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/status`,
                    {
                        status: 'banned',
                        reason: flagData.reason,
                        ipBan: flagData.ipBan
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION BAN] Success:', response.data);
                showModalMessage('User Banned', 'User has been permanently banned.');
            }
            else if (flagData.action === 'lift-warning') {
                // Lift warning from user
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                console.log('[MOD ACTION LIFT_WARNING] Lifting warning for user:', { userId, reason: flagData.reason, warningIndex: flagData.warningIndex });
                
                const response = await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/lift-warning`,
                    {
                        reason: flagData.reason,
                        warningIndex: flagData.warningIndex
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION LIFT_WARNING] Success:', response.data);
                showModalMessage('Warning Lifted', `User's warning count is now ${response.data.warningCount}.`);
            }
            else if (flagData.action === 'lift-suspension') {
                // Lift suspension from user
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                console.log('[MOD ACTION LIFT_SUSPENSION] Lifting suspension for user:', { userId, reason: flagData.reason });
                
                const response = await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/status`,
                    {
                        status: 'active',
                        reason: flagData.reason
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION LIFT_SUSPENSION] Success:', response.data);
                showModalMessage('Suspension Lifted', 'User account has been reactivated and can now log in.');
            }
            else if (flagData.action === 'lift-ban') {
                // Lift ban from user
                const userId = flagData.context?.type === 'profile' 
                    ? flagData.context?.userId 
                    : flagData.context?.ownerId;
                
                console.log('[MOD ACTION LIFT_BAN] Lifting ban for user:', { userId, reason: flagData.reason });
                
                const response = await axios.post(
                    `${API_BASE_URL}/moderation/users/${userId}/status`,
                    {
                        status: 'active',
                        reason: flagData.reason
                    },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                console.log('[MOD ACTION LIFT_BAN] Success:', response.data);
                showModalMessage('Ban Lifted', 'User account has been unbanned and can now log in.');
            }
        } catch (error) {
            console.error('[MOD ACTION] ERROR OCCURRED:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                errorData: error.response?.data,
                errorResponse: error.response,
                fullError: error
            });
            
            // Extract error message for user feedback
            const errorMsg = error.response?.data?.message 
                || error.response?.data?.error 
                || error.message 
                || 'An error occurred while performing this action.';
            
            console.error('[MOD ACTION] Showing error message to user:', errorMsg);
            showModalMessage('Action Failed', errorMsg);
        }
    }, [authToken]);


    useEffect(() => {
        // Fetch current user profile if authenticated
        const fetchUserProfile = async () => {
            if (authToken) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/users/profile`, {
                        headers: { Authorization: `Bearer ${authToken}` }
                    });
                    setUserProfile(response.data);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
        };
        fetchUserProfile();
    }, [authToken]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/public/profile/${userId}`);
                setProfile(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Profile not found or not public:', error);
                setNotFound(true);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-page-bg flex items-center justify-center p-6">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        This profile either doesn't exist or is not publicly visible.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
                    >
                        {authToken ? 'Go to Dashboard' : 'Login / Register'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-page-bg flex flex-col items-center p-6">
            <header className="w-full max-w-5xl bg-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center">
                <CustomAppLogo size="w-10 h-10" />
                <button
                    onClick={() => navigate('/')}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                    {authToken ? 'Dashboard' : 'Home'}
                </button>
            </header>
            <PublicProfileView
                profile={profile}
                onBack={() => navigate(-1)}
                onViewAnimal={(animal) => navigate(`/animal/${animal.id_public}`, { state: { from: `/user/${userId}` } })}
                API_BASE_URL={API_BASE_URL}
                authToken={authToken}
                setModCurrentContext={setModCurrentContext}
                currentUserIdPublic={userProfile?.id_public}
                currentUserRole={userProfile?.role}
                onStartMessage={authToken ? () => {
                    // Navigate to dashboard with message param to open conversation
                    navigate(`/?message=${profile.id_public}`);
                } : null}
            />
            
            {/* Moderator Action Sidebar - disabled, use mod panel instead */}
            {false && inModeratorMode && localStorage.getItem('moderationAuthenticated') === 'true' && (
                <ModeratorActionSidebar
                    isActive={true}
                    onOpenReportQueue={() => navigate('/')}
                    onQuickFlag={(flagData) => {
                        console.log('Quick flag from public route:', flagData);
                        handleModQuickFlag(flagData);
                    }}
                    onExitModeration={() => {
                        localStorage.removeItem('moderationAuthenticated');
                        window.location.href = '/';
                    }}
                    currentPage={window.location.pathname}
                    currentContext={modCurrentContext}
                    API_BASE_URL={API_BASE_URL}
                    authToken={authToken}
                />
            )}
            
            {/* Modal for moderation action feedback */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">{modalContent.title}</h2>
                        <p className="text-gray-600 mb-6">{modalContent.message}</p>
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-primary/90 transition"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Router Wrapper Component
const AppRouter = () => {
    // MAINTENANCE MODE LOCK - Only allow access from admin IP
    const [clientIp, setClientIp] = useState(null);

    useEffect(() => {
        const getClientIp = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/client-ip`);
                const detectedIp = response.data.ip || response.data.clientIp;
                setClientIp(detectedIp);
                console.log('Backend detected IP:', detectedIp);
            } catch (error) {
                console.warn('Could not determine IP');
                setClientIp('unknown');
            }
        };
        getClientIp();
    }, []);

    // LOCK DOWN: Only allow 86.80.92.156 OR with admin token
    const ADMIN_IP = '86.80.92.156';
    const ADMIN_TOKEN = localStorage.getItem('crittertrack_admin_token');
    const isAdminIP = clientIp === ADMIN_IP;
    const hasAdminToken = ADMIN_TOKEN === 'emergency_access_jan5_2025_secure';
    
    console.log('Access check:', { clientIp, isAdminIP, ADMIN_IP, hasAdminToken });
    
    // If not admin IP and no token, show maintenance screen
    // DISABLED - Allow everyone to access for testing
    if (false && clientIp && !isAdminIP && !hasAdminToken) {
        return <MaintenanceMode />;
    }
    
    // If still checking IP, show loading or maintenance screen
    // DISABLED - Allow everyone to access for testing
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






