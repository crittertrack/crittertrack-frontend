import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * useTransferWorkflow - Manages animal transfer and sale workflow
 * 
 * Features:
 * - Transfer/sell animals to other users
 * - Search for recipient users
 * - Pre-selection from budget view
 * - Price and notes for transaction
 * - Budget modal integration
 * 
 * @param authToken - Current auth token for API calls
 * @param API_BASE_URL - API base URL
 * @param showModalMessage - Modal message function for feedback
 * @returns Object with transfer workflow states and handlers
 */
export function useTransferWorkflow(
    authToken: string | null,
    API_BASE_URL: string,
    showModalMessage: (title: string, message: string) => void
) {
    // ========== TRANSFER MODAL & ANIMAL SELECTION ==========
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferAnimal, setTransferAnimal] = useState(null);
    const [preSelectedTransferAnimal, setPreSelectedTransferAnimal] = useState(null);
    const [preSelectedTransactionType, setPreSelectedTransactionType] = useState(null);

    // ========== BUDGET/TRANSACTION PANEL ==========
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);

    // ========== USER SEARCH STATES ==========
    const [transferUserQuery, setTransferUserQuery] = useState('');
    const [transferUserResults, setTransferUserResults] = useState([]);
    const [transferSelectedUser, setTransferSelectedUser] = useState(null);
    const [transferSearching, setTransferSearching] = useState(false);
    const [transferSearchPerformed, setTransferSearchPerformed] = useState(false);

    // ========== TRANSACTION DETAILS ==========
    const [transferPrice, setTransferPrice] = useState('');
    const [transferNotes, setTransferNotes] = useState('');

    // ========== HANDLER FUNCTIONS ==========

    /**
     * Search for users to transfer animal to
     * Called when user enters query and clicks search
     */
    const handleSearchTransferUser = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                setTransferUserResults([]);
                setTransferSearchPerformed(false);
                return;
            }

            setTransferSearching(true);
            setTransferSearchPerformed(false);

            try {
                const response = await axios.get(`${API_BASE_URL}/public/users/search`, {
                    params: { q: query },
                    headers: { Authorization: `Bearer ${authToken}` }
                });

                setTransferUserResults(response.data || []);
                setTransferSearchPerformed(true);
                console.log('[TRANSFER] Search results:', response.data?.length || 0, 'users');
            } catch (error) {
                console.error('[TRANSFER] Search failed:', error);
                showModalMessage('Search Failed', 'Could not search for users. Please try again.');
                setTransferUserResults([]);
            } finally {
                setTransferSearching(false);
            }
        },
        [authToken, API_BASE_URL, showModalMessage]
    );

    /**
     * Select a user as transfer recipient
     */
    const handleSelectTransferUser = useCallback((user) => {
        setTransferSelectedUser(user);
    }, []);

    /**
     * Submit transfer request
     * Sends transfer/sale to backend
     */
    const handleSubmitTransfer = useCallback(
        async (transferData) => {
            if (!transferData.animal || !transferData.recipient) {
                showModalMessage('Missing Information', 'Please select an animal and recipient.');
                return;
            }

            try {
                // Prepare transfer payload
                const payload = {
                    animalId_public: transferData.animal.id_public,
                    recipientUserId: transferData.recipient.userId_backend || transferData.recipient.id_public,
                    price: transferData.price ? parseFloat(transferData.price) : 0,
                    notes: transferData.notes || '',
                    transactionType: transferData.transactionType || 'transfer'
                };

                console.log('[TRANSFER] Submitting transfer:', payload);

                // Submit to backend
                const response = await axios.post(
                    `${API_BASE_URL}/animals/${transferData.animal.id_public}/transfer`,
                    payload,
                    {
                        headers: { Authorization: `Bearer ${authToken}` }
                    }
                );

                console.log('[TRANSFER] Transfer successful:', response.data);

                // Show success message
                const messageText =
                    transferData.price && parseFloat(transferData.price) > 0
                        ? `Animal sold for ${transferData.currency || '$'}${transferData.price}`
                        : 'Animal transferred successfully';

                showModalMessage('Transfer Complete', messageText);

                // Reset form
                handleCloseTransferWorkflow();

                // Emit event for external components to sync
                window.dispatchEvent(
                    new CustomEvent('animal-transferred', {
                        detail: { animalId: transferData.animal.id_public, recipientId: transferData.recipient.id_public }
                    })
                );
                window.dispatchEvent(new Event('animals-changed'));

                return response.data;
            } catch (error) {
                console.error('[TRANSFER] Transfer failed:', error);
                const errorMessage =
                    error.response?.data?.message || error.message || 'Transfer failed. Please try again.';
                showModalMessage('Transfer Failed', errorMessage);
                throw error;
            }
        },
        [authToken, API_BASE_URL, showModalMessage]
    );

    /**
     * Close transfer workflow and reset state
     */
    const handleCloseTransferWorkflow = useCallback(() => {
        setShowTransferModal(false);
        setBudgetModalOpen(false);
        setTransferAnimal(null);
        setTransferUserQuery('');
        setTransferUserResults([]);
        setTransferSelectedUser(null);
        setTransferSearchPerformed(false);
        setTransferPrice('');
        setTransferNotes('');
        setPreSelectedTransferAnimal(null);
        setPreSelectedTransactionType(null);
    }, []);

    /**
     * Open transfer modal with pre-selected animal
     * Called from budget view or animal detail
     */
    const handleOpenTransferWithAnimal = useCallback((animal, transactionType = 'transfer') => {
        setPreSelectedTransferAnimal(animal);
        setPreSelectedTransactionType(transactionType);
        setTransferAnimal(animal);
        setShowTransferModal(true);
    }, []);

    /**
     * Open budget modal for transaction management
     */
    const handleOpenBudgetModal = useCallback(() => {
        setBudgetModalOpen(true);
    }, []);

    /**
     * Close budget modal
     */
    const handleCloseBudgetModal = useCallback(() => {
        setBudgetModalOpen(false);
    }, []);

    // ========== RETURN ALL STATE & HANDLERS ==========
    return {
        // Modal States
        showTransferModal,
        setShowTransferModal,
        budgetModalOpen,
        setBudgetModalOpen,

        // Animal Selection
        transferAnimal,
        setTransferAnimal,
        preSelectedTransferAnimal,
        setPreSelectedTransferAnimal,
        preSelectedTransactionType,
        setPreSelectedTransactionType,

        // User Search States
        transferUserQuery,
        setTransferUserQuery,
        transferUserResults,
        setTransferUserResults,
        transferSelectedUser,
        setTransferSelectedUser,
        transferSearching,
        setTransferSearching,
        transferSearchPerformed,
        setTransferSearchPerformed,

        // Transaction Details
        transferPrice,
        setTransferPrice,
        transferNotes,
        setTransferNotes,

        // Handlers
        handleSearchTransferUser,
        handleSelectTransferUser,
        handleSubmitTransfer,
        handleCloseTransferWorkflow,
        handleOpenTransferWithAnimal,
        handleOpenBudgetModal,
        handleCloseBudgetModal,
    };
}
