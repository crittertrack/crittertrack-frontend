import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { withRetry } from '../utils/errorHandler'; // Assuming errorHandler.js is in src/utils

// Define interfaces for better type safety
interface User {
    userId_backend?: string;
    id_public?: string;
    // Add other user properties as they become relevant, e.g., name: string;
}

interface Animal {
    id_public: string;
    // Add other animal properties as they become relevant, e.g., name: string;
}

interface TransferData {
    animal: Animal;
    recipient: User;
    price?: string; // Changed from number to string to match useState and input
    notes?: string;
    transactionType?: 'transfer' | 'sale'; // Assuming these are the possible transaction types
    currency?: string; // Used in the success message
}

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
    showModalMessage: (title: string, message: string) => void,
) {
    // ========== TRANSFER MODAL & ANIMAL SELECTION ==========
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferAnimal, setTransferAnimal] = useState<Animal | null>(null);
    const [preSelectedTransferAnimal, setPreSelectedTransferAnimal] = useState<Animal | null>(null);
    const [preSelectedTransactionType, setPreSelectedTransactionType] = useState<'transfer' | 'sale' | null>(null);

    // ========== BUDGET/TRANSACTION PANEL ==========
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);

    // ========== USER SEARCH STATES ==========
    const [transferUserQuery, setTransferUserQuery] = useState('');
    const [transferUserResults, setTransferUserResults] = useState([]);
    const [transferSelectedUser, setTransferSelectedUser] = useState<User | null>(null);
    const [transferSearching, setTransferSearching] = useState(false);
    const [transferSearchPerformed, setTransferSearchPerformed] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

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
                const response = await withRetry(async () => {
                    return await axios.get(`${API_BASE_URL}/public/users/search`, {
                        params: { q: query },
                        headers: { Authorization: `Bearer ${authToken}` },
                        signal: abortController?.signal // Pass abort signal
                    });
                }, { maxRetries: 3, delayMs: 500 }); // Example: retry up to 3 times with 500ms initial delay

                setTransferUserResults(response.data || []);
                setTransferSearchPerformed(true);
                console.log('[TRANSFER] Search results:', response.data?.length || 0, 'users');
            } catch (error: unknown) {
                console.error('[TRANSFER] Search failed:', error);
                showModalMessage('Search Failed', (error as Error).message || 'Could not search for users. Please try again.');
                setTransferUserResults([]);
            } finally {
                setTransferSearching(false); // Ensure loading state is reset
            }
        },
        [authToken, API_BASE_URL, showModalMessage, abortController]
    );

    /**
     * Select a user as transfer recipient
     */
    const handleSelectTransferUser = useCallback((user: User) => {
        setTransferSelectedUser(user);
    }, []);

    /**
     * Submit transfer request
     * Sends transfer/sale to backend
     */    const handleSubmitTransfer = useCallback(
        async (transferData: TransferData) => {
            if (!transferData.animal || !transferData.recipient) {
                showModalMessage('Missing Information', 'Please select an animal and recipient.');
                return;
            }

            try {
                // Prepare transfer payload
                const payload = {
                    animalId_public: transferData.animal.id_public,
                    recipientUserId: transferData.recipient.userId_backend || transferData.recipient.id_public,
                    price: transferData.price ? parseFloat(transferData.price) : 0, // parseFloat now correctly applied to string
                    notes: transferData.notes || '',
                    transactionType: transferData.transactionType || 'transfer'
                };

                console.log('[TRANSFER] Submitting transfer:', payload);

                // Submit to backend
                const response = await withRetry(async () => {
                    return await axios.post(
                        `${API_BASE_URL}/animals/${transferData.animal.id_public}/transfer`,
                        payload,
                        {
                            headers: { Authorization: `Bearer ${authToken}` },
                            signal: abortController?.signal // Pass abort signal
                        }
                    );
                }, { maxRetries: 3, delayMs: 500 }); // Example: retry up to 3 times with 500ms initial delay
                
                console.log('[TRANSFER] Transfer successful:', response.data);

                // Show success message
                const messageText =
                    transferData.price && parseFloat(transferData.price) > 0 // parseFloat now correctly applied to string
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
            } catch (error: unknown) {
                console.error('[TRANSFER] Transfer failed:', error);
                const errorMessage =
                    (error as Error).message || (error as any).response?.data?.message || 'Transfer failed. Please try again.';
                showModalMessage('Transfer Failed', errorMessage);
                throw error;
            }
        }, // Dependencies for useCallback
        [authToken, API_BASE_URL, showModalMessage, abortController]
    );

    /**
     * Close transfer workflow and reset state
     */
    const handleCloseTransferWorkflow = useCallback(() => {
        setShowTransferModal(false);
        setBudgetModalOpen(false);
        setTransferAnimal(null); // Fix 4
        setTransferUserQuery('');
        setTransferUserResults([]);
        setTransferSelectedUser(null); // Fix 1
        setTransferSearchPerformed(false);
        setTransferPrice('');
        setTransferNotes('');
        setPreSelectedTransferAnimal(null);
        setPreSelectedTransactionType(null);
        abortController?.abort(); // Abort any ongoing requests when closing the workflow
        setAbortController(null); // Clear the controller
    }, [abortController]);

    /**
     * Open transfer modal with pre-selected animal
     * Called from budget view or animal detail
     */
    const handleOpenTransferWithAnimal = useCallback((animal: Animal, transactionType: 'transfer' | 'sale' = 'transfer') => {
        // Create a new AbortController for this workflow instance
        const controller = new AbortController();
        setAbortController(controller);

        setPreSelectedTransferAnimal(animal); // Fix 4
        setPreSelectedTransactionType(transactionType); // Fix 5
        setTransferAnimal(animal); // Fix 4
        setBudgetModalOpen(false); // Ensure budget modal is closed when transfer modal opens
        setShowTransferModal(true);
    }, []); // No dependencies needed here, as it creates a new controller each time

    // Cleanup AbortController on unmount of the component using this hook
    useEffect(() => {
        return () => {
            abortController?.abort();
        };
    }, [abortController]);

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
