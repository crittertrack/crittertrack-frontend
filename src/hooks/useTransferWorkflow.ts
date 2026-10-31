import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import apiClient from '../utils/apiClient';
import { withRetry } from '../utils/errorHandler';

interface User {
    userId_backend?: string;
    id_public?: string;
    [key: string]: unknown;
}

interface Animal {
    id_public: string;
    [key: string]: unknown;
}

interface TransferData {
    animal: Animal;
    recipient: User;
    price?: string;
    notes?: string;
    transferType?: 'sale' | 'purchase' | 'gift';
    currency?: string;
}

type PreSelectedTransactionType = 'transfer' | 'sale';
type TransactionType = 'ownership' | 'gift' | 'sale' | 'purchase' | 'recall' | 'return';

export function useTransferWorkflow(
    _authToken: string | null,
    _API_BASE_URL: string,
    showModalMessage: (title: string, message: string) => void,
) {
    // Transfer modal and animal selection
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [transferAnimal, setTransferAnimal] = useState<Animal | null>(null);
    const [preSelectedTransferAnimal, setPreSelectedTransferAnimal] = useState<Animal | null>(null);
    const [preSelectedTransactionType, setPreSelectedTransactionType] =
        useState<PreSelectedTransactionType | null>(null);
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);

    // Recipient search
    const [transferUserQuery, setTransferUserQuery] = useState('');
    const [transferUserResults, setTransferUserResults] = useState<User[]>([]);
    const [transferSelectedUser, setTransferSelectedUser] = useState<User | null>(null);
    const [transferSearching, setTransferSearching] = useState(false);
    const [transferSearchPerformed, setTransferSearchPerformed] = useState(false);

    // Request controller is kept in a ref so changing it does not trigger a render.
    const abortControllerRef = useRef<AbortController | null>(null);

    // Transfer action states
    const [transferViewingAnimal, setTransferViewingAnimal] = useState<Animal | null>(null);
    const [returningAnimal, setReturningAnimal] = useState(false);

    // Transaction details and bulk transfer
    const [transferPrice, setTransferPrice] = useState('');
    const [transferNotes, setTransferNotes] = useState('');
    const [transferType, setTransferType] = useState<TransactionType>('gift');
    const [bulkMode, setBulkMode] = useState(false);
    const [transferAnimals, setTransferAnimals] = useState<Animal[]>([]);

    const handleCloseTransferWorkflow = useCallback(() => {
        setShowTransferModal(false);
        setTransferAnimal(null);
        setTransferUserQuery('');
        setTransferUserResults([]);
        setTransferSelectedUser(null);
        setTransferSearching(false);
        setTransferSearchPerformed(false);
        setTransferPrice('');
        setTransferNotes('');
        setPreSelectedTransferAnimal(null);
        setPreSelectedTransactionType(null);

        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
    }, []);

    const handleSearchTransferUser = useCallback(async () => {
        const query = transferUserQuery.trim();

        if (!query) {
            setTransferUserResults([]);
            setTransferSearchPerformed(false);
            return;
        }

        // Cancel any previous search before starting another one.
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setTransferSearching(true);
        setTransferSearchPerformed(false);

        try {
            const response = await withRetry(
                async () => apiClient.get('/public/profiles/search', {
                    params: { query },
                    signal: controller.signal,
                }),
                { maxRetries: 3, delayMs: 500 },
            );

            if (controller.signal.aborted) return;

            setTransferUserResults(Array.isArray(response.data) ? response.data : []);
            setTransferSearchPerformed(true);
            console.log(
                '[TRANSFER] Search results:',
                Array.isArray(response.data) ? response.data.length : 0,
                'users',
            );
        } catch (error: unknown) {
            if (controller.signal.aborted || axios.isCancel(error)) return;

            console.error('[TRANSFER] Search failed:', error);
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : error instanceof Error
                    ? error.message
                    : 'Could not search for users. Please try again.';

            showModalMessage('Search Failed', message);
            setTransferUserResults([]);
        } finally {
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
                setTransferSearching(false);
            }
        }
    }, [transferUserQuery, showModalMessage]);

    const handleSelectTransferUser = useCallback((user: User) => {
        setTransferSelectedUser(user);
    }, []);

    const handleOpenAnimalSaleModal = useCallback((animal: Animal) => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setTransferAnimal(animal);
        setPreSelectedTransferAnimal(animal);
        setPreSelectedTransactionType(null);
        setBudgetModalOpen(true);
        setShowTransferModal(true);
    }, []);

    const handleOpenTransferWithAnimal = useCallback((
        animal: Animal,
        transactionType: PreSelectedTransactionType = 'transfer',
    ) => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setPreSelectedTransferAnimal(animal);
        setPreSelectedTransactionType(transactionType);
        setTransferAnimal(animal);
        setShowTransferModal(true);
    }, []);

    const handleSubmitTransfer = useCallback(async (transferData: TransferData) => {
        if (!transferData.animal || !transferData.recipient) {
            showModalMessage('Missing Information', 'Please select an animal and recipient.');
            return;
        }

        const recipientId =
            transferData.recipient.userId_backend || transferData.recipient.id_public;

        if (!recipientId) {
            showModalMessage('Missing Information', 'The selected recipient has no valid user ID.');
            return;
        }

        const parsedPrice = transferData.price?.trim()
            ? Number.parseFloat(transferData.price)
            : 0;

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            showModalMessage('Invalid Price', 'Please enter a valid, non-negative price.');
            return;
        }

        const payload = {
            animalId_public: transferData.animal.id_public,
            toUserId: recipientId,
            price: parsedPrice,
            notes: transferData.notes || '',
            transferType: transferData.transferType || 'gift',
        };

        console.log('[TRANSFER] Submitting transfer:', payload);

        try {
            // Do not automatically retry this POST: a retry could create a duplicate request.
            const response = await apiClient.post('/transfers', payload);

            console.log('[TRANSFER] Transfer successful:', response.data);

            const messageText = parsedPrice > 0
                ? 'Sale request sent. The recipient must accept before ownership changes.'
                : 'Transfer request sent. The recipient has been notified and must accept before ownership changes.';

            showModalMessage('Request Sent', messageText);
            handleCloseTransferWorkflow();

            window.dispatchEvent(new CustomEvent('animal-transferred', {
                detail: {
                    animalId: transferData.animal.id_public,
                    recipientId,
                },
            }));
            window.dispatchEvent(new Event('animals-changed'));

            return response.data;
        } catch (error: unknown) {
            console.error('[TRANSFER] Transfer failed:', error);

            let errorMessage = 'Transfer failed. Please try again.';
            if (axios.isAxiosError(error) && error.response) {
                errorMessage = error.response.status === 409
                    ? 'This animal already has a pending transfer request.'
                    : error.response.data?.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            showModalMessage('Transfer Failed', errorMessage);
            throw error;
        }
    }, [showModalMessage, handleCloseTransferWorkflow]);

    // Actions available from AnimalModalV2
    const handleWithdrawTransfer = useCallback(async (transferId: string) => {
        if (!transferId) return;

        if (!window.confirm('Are you sure you want to withdraw this transfer request?')) {
            return;
        }

        try {
            await apiClient.post(`/transfers/${transferId}/withdraw`, {});
            showModalMessage('Success', 'Transfer request has been withdrawn.');
            window.dispatchEvent(new Event('animals-changed'));
        } catch (error: unknown) {
            console.error('Failed to withdraw transfer:', error);
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : error instanceof Error ? error.message : 'An unexpected error occurred.';
            showModalMessage('Error', `Failed to withdraw transfer: ${message}`);
        }
    }, [showModalMessage]);

    const handleAcceptTransfer = useCallback(async (transferId: string) => {
        if (!transferId) return;

        if (!window.confirm('Accept this transfer and take ownership of this animal?')) {
            return;
        }

        try {
            await apiClient.post(`/transfers/${transferId}/accept`, {});
            showModalMessage('Success', 'Transfer accepted. You are now the owner of this animal.');
            window.dispatchEvent(new Event('animals-changed'));
        } catch (error: unknown) {
            console.error('Failed to accept transfer:', error);
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : error instanceof Error ? error.message : 'An unexpected error occurred.';
            showModalMessage('Error', `Failed to accept transfer: ${message}`);
        }
    }, [showModalMessage]);

    const handleRejectTransfer = useCallback(async (transferId: string) => {
        if (!transferId) return;

        if (!window.confirm('Decline this transfer request?')) {
            return;
        }

        try {
            await apiClient.post(`/transfers/${transferId}/decline`, {});
            showModalMessage('Success', 'Transfer request declined.');
            window.dispatchEvent(new Event('animals-changed'));
        } catch (error: unknown) {
            console.error('Failed to decline transfer:', error);
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : error instanceof Error ? error.message : 'An unexpected error occurred.';
            showModalMessage('Error', `Failed to decline transfer: ${message}`);
        }
    }, [showModalMessage]);

    const handleBulkTransfer = useCallback(async () => {
        if (transferAnimals.length === 0 || !transferSelectedUser) {
            showModalMessage('Error', 'Please select animals and a recipient.');
            return;
        }

        const recipientId =
            transferSelectedUser.userId_backend || transferSelectedUser.id_public;

        if (!recipientId) {
            showModalMessage('Error', 'The selected recipient has no valid user ID.');
            return;
        }

        const parsedPrice = transferPrice.trim()
            ? Number.parseFloat(transferPrice)
            : undefined;

        if (parsedPrice !== undefined && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
            showModalMessage('Invalid Price', 'Please enter a valid, non-negative price.');
            return;
        }

        try {
            // Do not automatically retry this POST: it may create duplicate transfer requests.
            await apiClient.post('/transfers/bulk', {
                animalIds_public: transferAnimals.map((animal) => animal.id_public),
                toUserId: recipientId,
                price: parsedPrice,
                notes: transferNotes || undefined,
                transferType,
            });

            showModalMessage(
                'Success',
                `Bulk transfer request sent for ${transferAnimals.length} animal${transferAnimals.length !== 1 ? 's' : ''}.`,
            );

            setBulkMode(false);
            setTransferAnimals([]);
            setTransferPrice('');
            setTransferNotes('');
            setTransferType('gift');
            setTransferSelectedUser(null);
            window.dispatchEvent(new Event('animals-changed'));
        } catch (error: unknown) {
            console.error('Failed to bulk transfer:', error);
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : error instanceof Error ? error.message : 'An unexpected error occurred.';
            showModalMessage('Error', `Failed to bulk transfer: ${message}`);
        }
    }, [
        transferAnimals,
        transferSelectedUser,
        transferPrice,
        transferNotes,
        transferType,
        showModalMessage,
    ]);

    const handleBulkTransferWithdraw = useCallback(async (batchId: string) => {
        if (!batchId) {
            showModalMessage('Error', 'Batch ID is required.');
            return;
        }

        try {
            await apiClient.post('/transfers/bulk/withdraw', { batchId });
            showModalMessage('Success', 'Bulk transfer withdrawn successfully.');
            window.dispatchEvent(new Event('animals-changed'));
        } catch (error: unknown) {
            console.error('Failed to withdraw bulk transfer:', error);
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : error instanceof Error ? error.message : 'An unexpected error occurred.';
            showModalMessage('Error', `Failed to withdraw bulk transfer: ${message}`);
        }
    }, [showModalMessage]);

    // Handle bulk transfer submission
    const handleSubmitBulkTransfer = useCallback(async () => {
        if (transferAnimals.length === 0) {
            showModalMessage('Error', 'Please select at least one animal to transfer.');
            return;
        }
        if (!transferSelectedUser) {
            showModalMessage('Error', 'Please select a recipient.');
            return;
        }
        if (transferPrice === '' || transferPrice === null) {
            showModalMessage('Error', 'Please enter a price.');
            return;
        }

        const parsedPrice = parseFloat(transferPrice) || 0;
        const recipientId = transferSelectedUser.userId_backend || transferSelectedUser.id_public;

        try {
            const { data } = await apiClient.post('/transfers/bulk', {
                animalIds_public: transferAnimals.map((animal) => animal.id_public),
                toUserId: recipientId,
                price: parsedPrice,
                notes: transferNotes,
                transferType: transferType,
            });

            showModalMessage('Success', `Bulk transfer requested for ${data.transfers.length} animal(s).`);
            window.dispatchEvent(new Event('animals-changed'));

            // Reset bulk transfer state
            setTransferAnimals([]);
            setTransferSelectedUser(null);
            setTransferPrice('');
            setTransferNotes('');
            setTransferType('gift');
            setBulkMode(false);
        } catch (error: unknown) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : error instanceof Error ? error.message : 'An unexpected error occurred.';
            showModalMessage('Error', `Failed to create bulk transfer: ${message}`);
        }
    }, [transferAnimals, transferSelectedUser, transferPrice, transferNotes, transferType, showModalMessage, setTransferAnimals, setTransferSelectedUser, setTransferPrice, setTransferNotes, setBulkMode]);

    const handleOpenBulkTransferWithAnimals = useCallback((animals: Animal[]) => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();
        setTransferAnimals(animals);
        setBulkMode(true);
        setTransferAnimal(null);
        setTransferUserQuery('');
        setTransferUserResults([]);
        setTransferSelectedUser(null);
        setTransferSearching(false);
        setTransferSearchPerformed(false);
        setTransferPrice('');
        setTransferNotes('');
        setShowTransferModal(true);
    }, []);

    const handleReturnTransferredAnimal = useCallback(async (animalId_public?: string) => {
        const id = animalId_public || transferViewingAnimal?.id_public;
        if (!id || returningAnimal) return;

        if (!window.confirm(
            'Return this animal to the original breeder? This will transfer ownership back.',
        )) {
            return;
        }

        setReturningAnimal(true);
        try {
            await apiClient.post('/transfers/return', { animalId_public: id });
            showModalMessage('Success', 'Return request sent to the original breeder.');
            window.dispatchEvent(new Event('animals-changed'));
        } catch (error: unknown) {
            console.error('Failed to return animal:', error);
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : error instanceof Error ? error.message : 'An unexpected error occurred.';
            showModalMessage('Error', `Failed to return animal: ${message}`);
        } finally {
            setReturningAnimal(false);
        }
    }, [transferViewingAnimal, returningAnimal, showModalMessage]);

    // Abort an outstanding search if the component using this hook unmounts.
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
            abortControllerRef.current = null;
        };
    }, []);

    return {
        // Modal states
        showTransferModal,
        setShowTransferModal,
        budgetModalOpen,
        setBudgetModalOpen,

        // Animal selection
        transferAnimal,
        setTransferAnimal,
        preSelectedTransferAnimal,
        setPreSelectedTransferAnimal,
        preSelectedTransactionType,
        setPreSelectedTransactionType,

        // Recipient search
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

        // Transaction details
        transferPrice,
        setTransferPrice,
        transferNotes,
        setTransferNotes,
        transferType,
        setTransferType,

        // Bulk transfer
        bulkMode,
        setBulkMode,
        transferAnimals,
        setTransferAnimals,

        // Transfer action states
        transferViewingAnimal,
        setTransferViewingAnimal,
        returningAnimal,

        // Handlers
        handleSearchTransferUser,
        handleSelectTransferUser,
        handleSubmitTransfer,
        handleCloseTransferWorkflow,
        handleOpenTransferWithAnimal,
        handleOpenAnimalSaleModal,
        handleWithdrawTransfer,
        handleAcceptTransfer,
        handleRejectTransfer,
        handleBulkTransfer,
        handleOpenBulkTransferWithAnimals,
        handleBulkTransferWithdraw,
        handleSubmitBulkTransfer,
        handleReturnTransferredAnimal,
    };
}
