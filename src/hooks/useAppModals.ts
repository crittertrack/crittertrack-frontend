import { useState, useCallback } from 'react';

interface Animal {
    id_public: string;
    // Add other animal properties as they become relevant, e.g., name: string;
}

interface User {
    userId_backend?: string;
    id_public?: string;
    // Add other animal properties as they become relevant, e.g., name: string;
}

/**
 * useAppModals - Centralized modal state management
 * 
 * Consolidates 25+ modal visibility states into a single hook with:
 * - Individual state getters/setters for each modal
 * - Helper functions: openModal(), closeModal(), toggleModal()
 * - Related data states (e.g., modalMessage, selectedConversation)
 * - Type-safe state updates
 * 
 * @returns Object with all modal states and helper functions
 */
export function useAppModals() {
    // ========== CORE MODAL SYSTEM ==========
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState({ title: '', message: '' });
    const [isRegister, setIsRegister] = useState(false);

    // ========== MESSAGE & COMMUNICATION ==========
    const [showMessages, setShowMessages] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [unreadAdminMessageCount, setUnreadAdminMessageCount] = useState(0);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    // ========== NOTIFICATIONS ==========
    const [showNotifications, setShowNotifications] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    // ========== PUBLIC PROFILE & ANIMALS ==========
    const [showUserSearchModal, setShowUserSearchModal] = useState(false);
    const [showQRAnimal, setShowQRAnimal] = useState(false);

    // ========== ANIMAL IMAGES & MEDIA ==========
    const [showImageModal, setShowImageModal] = useState(false);
    const [enlargedImageUrl, setEnlargedImageUrl] = useState(null);
    const [showPedigreeChart, setShowPedigreeChart] = useState(false);
    const [copySuccessAnimal, setCopySuccessAnimal] = useState(false);

    // ========== BREEDING & LITTER MANAGEMENT ==========
    const [showCreateLitterModal, setShowCreateLitterModal] = useState(false);
    const [showLinkLitterModal, setShowLinkLitterModal] = useState(false);
    const [breedingRecordForLitter, setBreedingRecordForLitter] = useState(null);
    const [expandedBreedingRecords, setExpandedBreedingRecords] = useState({});
    const [breedingRecordLitters, setBreedingRecordLitters] = useState({});

    // ========== FEEDBACK & BUG REPORTS ==========
    const [showBugReportModal, setShowBugReportModal] = useState(false);
    const [bugReportCategory, setBugReportCategory] = useState('Bug');
    const [bugReportDescription, setBugReportDescription] = useState('');
    const [bugReportSubmitting, setBugReportSubmitting] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackSpecies, setFeedbackSpecies] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

    // ========== ONBOARDING & GUIDES ==========
    const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
    const [hasSeenWelcomeGuide, setHasSeenWelcomeGuide] = useState(false);
    const [hasSeenDonationHighlight, setHasSeenDonationHighlight] = useState(
        localStorage.getItem('hasSeenDonationHighlight') === 'true'
    );

    // ========== POLICY & LEGAL MODALS ==========
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    // ========== ARCHIVE & HISTORY ==========
    const [showArchiveScreen, setShowArchiveScreen] = useState(false);

    // ========== ADMIN & MODERATION ==========
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showModReportQueue, setShowModReportQueue] = useState(false);
    const [showModerationAuthModal, setShowModerationAuthModal] = useState(false);
    const [showInfoTab, setShowInfoTab] = useState(false);

    // ========== SYSTEM & MAINTENANCE ==========
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');
    const [showUrgentNotification, setShowUrgentNotification] = useState(false);
    const [urgentNotificationData, setUrgentNotificationData] = useState({ title: '', content: '' });

    // ========== MENUS & LAYOUT ==========
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // ========== HELPER FUNCTIONS ==========

    /**
     * Generic openModal function - opens any modal by name
     * @param name - Modal state name (e.g., 'showMessages', 'showAdminPanel')
     */
    const openModal = useCallback((name: string) => {
        const setters: Record<string, any> = {
            showModal,
            showMessages,
            showNotifications,
            showUserSearchModal,
            showQRAnimal,
            showImageModal,
            showPedigreeChart,
            showCreateLitterModal,
            showLinkLitterModal,
            showBugReportModal,
            showFeedbackModal,
            showWelcomeGuide,
            showTermsModal,
            showPrivacyModal,
            showArchiveScreen,
            showAdminPanel,
            showModReportQueue,
            showModerationAuthModal,
            showInfoTab,
            maintenanceMode,
            showUrgentNotification,
            showProfileMenu,
        };

        // Map of state names to their setters
        const modalSetters: Record<string, (value: boolean) => void> = {
            showModal: setShowModal,
            showMessages: setShowMessages,
            showNotifications: setShowNotifications,
            showUserSearchModal: setShowUserSearchModal,
            showQRAnimal: setShowQRAnimal,
            showImageModal: setShowImageModal,
            showPedigreeChart: setShowPedigreeChart,
            showCreateLitterModal: setShowCreateLitterModal,
            showLinkLitterModal: setShowLinkLitterModal,
            showBugReportModal: setShowBugReportModal,
            showFeedbackModal: setShowFeedbackModal,
            showWelcomeGuide: setShowWelcomeGuide,
            showTermsModal: setShowTermsModal,
            showPrivacyModal: setShowPrivacyModal,
            showArchiveScreen: setShowArchiveScreen,
            showAdminPanel: setShowAdminPanel,
            showModReportQueue: setShowModReportQueue,
            showModerationAuthModal: setShowModerationAuthModal,
            showInfoTab: setShowInfoTab,
            maintenanceMode: setMaintenanceMode,
            showUrgentNotification: setShowUrgentNotification,
            showProfileMenu: setShowProfileMenu,
        };

        if (modalSetters[name]) {
            modalSetters[name](true);
        } else {
            console.warn(`Modal '${name}' not found in openModal`);
        }
    }, []);

    /**
     * Generic closeModal function - closes any modal by name
     * @param name - Modal state name
     */
    const closeModal = useCallback((name: string) => {
        const modalSetters: Record<string, (value: boolean) => void> = {
            showModal: setShowModal,
            showMessages: setShowMessages,
            showNotifications: setShowNotifications,
            showUserSearchModal: setShowUserSearchModal,
            showQRAnimal: setShowQRAnimal,
            showImageModal: setShowImageModal,
            showPedigreeChart: setShowPedigreeChart,
            showCreateLitterModal: setShowCreateLitterModal,
            showLinkLitterModal: setShowLinkLitterModal,
            showBugReportModal: setShowBugReportModal,
            showFeedbackModal: setShowFeedbackModal,
            showWelcomeGuide: setShowWelcomeGuide,
            showTermsModal: setShowTermsModal,
            showPrivacyModal: setShowPrivacyModal,
            showArchiveScreen: setShowArchiveScreen,
            showAdminPanel: setShowAdminPanel,
            showModReportQueue: setShowModReportQueue,
            showModerationAuthModal: setShowModerationAuthModal,
            showInfoTab: setShowInfoTab,
            maintenanceMode: setMaintenanceMode,
            showUrgentNotification: setShowUrgentNotification,
            showProfileMenu: setShowProfileMenu,
        };

        if (modalSetters[name]) {
            modalSetters[name](false);
        } else {
            console.warn(`Modal '${name}' not found in closeModal`);
        }
    }, []);

    /**
     * Generic toggleModal function - toggles any modal by name
     * @param name - Modal state name
     */
    const toggleModal = useCallback((name: string) => {
        const modalStates: Record<string, [any, (value: any) => void]> = {
            showModal: [showModal, setShowModal],
            showMessages: [showMessages, setShowMessages],
            showNotifications: [showNotifications, setShowNotifications],
            showUserSearchModal: [showUserSearchModal, setShowUserSearchModal],
            showQRAnimal: [showQRAnimal, setShowQRAnimal],
            showImageModal: [showImageModal, setShowImageModal],
            showPedigreeChart: [showPedigreeChart, setShowPedigreeChart],
            showCreateLitterModal: [showCreateLitterModal, setShowCreateLitterModal],
            showLinkLitterModal: [showLinkLitterModal, setShowLinkLitterModal],
            showBugReportModal: [showBugReportModal, setShowBugReportModal],
            showFeedbackModal: [showFeedbackModal, setShowFeedbackModal],
            showWelcomeGuide: [showWelcomeGuide, setShowWelcomeGuide],
            showTermsModal: [showTermsModal, setShowTermsModal],
            showPrivacyModal: [showPrivacyModal, setShowPrivacyModal],
            showArchiveScreen: [showArchiveScreen, setShowArchiveScreen],
            showAdminPanel: [showAdminPanel, setShowAdminPanel],
            showModReportQueue: [showModReportQueue, setShowModReportQueue],
            showModerationAuthModal: [showModerationAuthModal, setShowModerationAuthModal],
            showInfoTab: [showInfoTab, setShowInfoTab],
            maintenanceMode: [maintenanceMode, setMaintenanceMode],
            showUrgentNotification: [showUrgentNotification, setShowUrgentNotification],
            showProfileMenu: [showProfileMenu, setShowProfileMenu],
        };

        const [currentState, setter] = modalStates[name] || [];
        if (setter !== undefined) {
            setter(!currentState);
        } else {
            console.warn(`Modal '${name}' not found in toggleModal`);
        }
    }, [
        showModal,
        showMessages,
        showNotifications,
        showUserSearchModal,
        showQRAnimal,
        showImageModal,
        showPedigreeChart,
        showCreateLitterModal,
        showLinkLitterModal,
        showBugReportModal,
        showFeedbackModal,
        showWelcomeGuide,
        showTermsModal,
        showPrivacyModal,
        showArchiveScreen,
        showAdminPanel,
        showModReportQueue,
        showModerationAuthModal,
        showInfoTab,
        maintenanceMode,
        showUrgentNotification,
        showProfileMenu,
    ]);

    /**
     * Clear all modal states (for full reset)
     */
    const clearAllModals = useCallback(() => {
        setShowModal(false);
        setShowMessages(false);
        setShowNotifications(false);
        setShowUserSearchModal(false);
        setShowQRAnimal(false);
        setShowImageModal(false);
        setShowPedigreeChart(false);
        setShowCreateLitterModal(false);
        setShowLinkLitterModal(false);
        setShowBugReportModal(false);
        setShowFeedbackModal(false);
        setShowWelcomeGuide(false);
        setShowTermsModal(false);
        setShowPrivacyModal(false);
        setShowArchiveScreen(false);
        setShowAdminPanel(false);
        setShowModReportQueue(false);
        setShowModerationAuthModal(false);
        setShowInfoTab(false);
        setMaintenanceMode(false);
        setShowUrgentNotification(false);
        setShowProfileMenu(false);
    }, []);

    // ========== RETURN ALL STATE & HELPERS ==========
    return {
        // Core modal system
        showModal,
        setShowModal,
        modalMessage,
        setModalMessage,
        isRegister,
        setIsRegister,

        // Messages & Communication
        showMessages,
        setShowMessages,
        unreadMessageCount,
        setUnreadMessageCount,
        unreadAdminMessageCount,
        setUnreadAdminMessageCount,
        selectedConversation,
        setSelectedConversation,
        conversations,
        setConversations,
        messages,
        setMessages,
        newMessage,
        setNewMessage,
        sendingMessage,
        setSendingMessage,

        // Notifications
        showNotifications,
        setShowNotifications,
        notificationCount,
        setNotificationCount,

        // Public Profile & Animals
        showUserSearchModal,
        setShowUserSearchModal,
        showQRAnimal,
        setShowQRAnimal,

        // Images & Media
        showImageModal,
        setShowImageModal,
        enlargedImageUrl,
        setEnlargedImageUrl,
        showPedigreeChart,
        setShowPedigreeChart,
        copySuccessAnimal,
        setCopySuccessAnimal,

        // Breeding & Litter
        showCreateLitterModal,
        setShowCreateLitterModal,
        showLinkLitterModal,
        setShowLinkLitterModal,
        breedingRecordForLitter,
        setBreedingRecordForLitter,
        expandedBreedingRecords,
        setExpandedBreedingRecords,
        breedingRecordLitters,
        setBreedingRecordLitters,

        // Feedback & Bug Reports
        showBugReportModal,
        setShowBugReportModal,
        bugReportCategory,
        setBugReportCategory,
        bugReportDescription,
        setBugReportDescription,
        bugReportSubmitting,
        setBugReportSubmitting,
        showFeedbackModal,
        setShowFeedbackModal,
        feedbackSpecies,
        setFeedbackSpecies,
        feedbackText,
        setFeedbackText,
        feedbackSubmitting,
        setFeedbackSubmitting,

        // Onboarding & Guides
        showWelcomeGuide,
        setShowWelcomeGuide,
        hasSeenWelcomeGuide,
        setHasSeenWelcomeGuide,
        hasSeenDonationHighlight,
        setHasSeenDonationHighlight,

        // Policy & Legal
        showTermsModal,
        setShowTermsModal,
        showPrivacyModal,
        setShowPrivacyModal,

        // Archive & History
        showArchiveScreen,
        setShowArchiveScreen,

        // Admin & Moderation
        showAdminPanel,
        setShowAdminPanel,
        showModReportQueue,
        setShowModReportQueue,
        showModerationAuthModal,
        setShowModerationAuthModal,
        showInfoTab,
        setShowInfoTab,

        // System & Maintenance
        maintenanceMode,
        setMaintenanceMode,
        maintenanceMessage,
        setMaintenanceMessage,
        showUrgentNotification,
        setShowUrgentNotification,
        urgentNotificationData,
        setUrgentNotificationData,

        // Menus & Layout
        showProfileMenu,
        setShowProfileMenu,

        // Helper Functions
        openModal,
        closeModal,
        toggleModal,
        clearAllModals,
    };
}
