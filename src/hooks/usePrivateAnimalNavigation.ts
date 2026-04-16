import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * usePrivateAnimalNavigation - Manages private (owned) animal viewing and editing
 * 
 * Features:
 * - View/edit owned animals from various entry points
 * - Navigation history stack for deep drilling without routing
 * - Tab management for detail view (stats, genetics, lineage, etc.)
 * - Pedigree data fetching (sire, dam, offspring)
 * - Return path references for navigation context
 * - Auto-clear history when all animals are closed
 * 
 * @param authToken - Current auth token for API calls
 * @param API_BASE_URL - API base URL
 * @returns Object with animal viewing states, handlers, and pedigree data
 */
export function usePrivateAnimalNavigation(authToken: string | null, API_BASE_URL: string) {
    // ========== PRIVATE ANIMAL VIEWING STATES ==========
    const [animalToView, setAnimalToView] = useState(null);
    const [animalToEdit, setAnimalToEdit] = useState(null);
    const [animalViewHistory, setAnimalViewHistory] = useState([]);
    const [privateAnimalInitialTab, setPrivateAnimalInitialTab] = useState(1);
    const [privateBetaView, setPrivateBetaView] = useState('vertical');
    const [detailViewTab, setDetailViewTab] = useState(1);
    const [speciesToAdd, setSpeciesToAdd] = useState(null);
    const [viewAnimalBreederInfo, setViewAnimalBreederInfo] = useState(null);

    // ========== PEDIGREE DATA (ASYNC-FETCHED) ==========
    const [sireData, setSireData] = useState(null);
    const [damData, setDamData] = useState(null);
    const [offspringData, setOffspringData] = useState([]);

    // ========== NAVIGATION REFS (PERSISTENT ACROSS RENDERS) ==========
    // These store the path to return to when closing views - not state, so they don't trigger re-renders
    const viewReturnPathRef = useRef('/'); // Path to return to when closing /view-animal
    const editReturnPathRef = useRef('/view-animal'); // Path to return to when closing /edit-animal

    // ========== HELPER: Force parent cards to refetch ==========
    const [parentCardKey, setParentCardKey] = useState(0);

    // ========== HANDLER FUNCTIONS ==========

    /**
     * View an animal - adds to history stack
     * Called when user clicks on an animal from list/search
     * Handles fetching latest data and setting up return paths
     */
    const handleViewAnimal = useCallback(
        (animal) => {
            if (!animal) return;

            // Add current animal to history before viewing new one
            if (animalToView) {
                setAnimalViewHistory(prev => [...prev, animalToView]);
            }

            // Set the new animal to view
            setAnimalToView(animal);
            setAnimalToEdit(null);
            setViewAnimalBreederInfo(null);

            // Trigger pedigree data fetch (via separate effect)
        },
        [animalToView]
    );

    /**
     * Edit an animal
     */
    const handleEditAnimal = useCallback((animal) => {
        setAnimalToEdit(animal);
        setAnimalToView(null);
    }, []);

    /**
     * Go back to previous animal in view history
     * Pops from history or closes view if no history
     */
    const handleBackFromAnimal = useCallback(() => {
        if (animalViewHistory.length > 0) {
            // Pop from history
            const newHistory = [...animalViewHistory];
            const previousAnimal = newHistory.pop();
            setAnimalViewHistory(newHistory);
            setAnimalToView(previousAnimal);
            setSireData(null);
            setDamData(null);
            setOffspringData([]);
        } else {
            // No history - close view
            setAnimalToView(null);
            setSireData(null);
            setDamData(null);
            setOffspringData([]);
        }
    }, [animalViewHistory]);

    /**
     * Close all animal views and clear history
     */
    const handleCloseAllAnimals = useCallback(() => {
        setAnimalToView(null);
        setAnimalToEdit(null);
        setAnimalViewHistory([]);
        setSireData(null);
        setDamData(null);
        setOffspringData([]);
    }, []);

    /**
     * Save edited animal
     * Called after form submission - closes edit mode and returns to view
     */
    const handleSaveAnimal = useCallback((updatedAnimal) => {
        // Update the viewed animal with new data
        setAnimalToView(updatedAnimal);
        setAnimalToEdit(null);
    }, []);

    /**
     * Archive an animal
     * Removes from view and shows confirmation
     */
    const handleArchiveAnimal = useCallback((animalId) => {
        // Go back to previous animal or close
        handleBackFromAnimal();
    }, [handleBackFromAnimal]);

    /**
     * Delete an animal permanently
     * Closes all views and clears history
     */
    const handleDeleteAnimal = useCallback(() => {
        handleCloseAllAnimals();
    }, [handleCloseAllAnimals]);

    /**
     * Toggle owned/unowned status
     */
    const toggleAnimalOwned = useCallback((animalId) => {
        // Keep animal in view but mark as unowned
        // UI will show different options
    }, []);

    /**
     * Restore a view-only animal (when viewing unowned animal)
     */
    const handleRestoreViewOnlyAnimal = useCallback((animal) => {
        setAnimalToView(animal);
        setAnimalToEdit(null);
    }, []);

    // ========== EFFECTS ==========

    /**
     * Force parent cards to refetch when Lineage tab opens
     */
    useEffect(() => {
        if (detailViewTab === 5) {
            setParentCardKey(k => k + 1);
        }
    }, [detailViewTab]);

    /**
     * Clear history when animal view is completely closed
     */
    useEffect(() => {
        if (!animalToView) {
            setAnimalViewHistory([]);
        }
    }, [animalToView]);

    /**
     * Fetch pedigree data when viewing an animal
     * Gets sire, dam, and offspring data from API
     */
    useEffect(() => {
        if (!animalToView || !authToken) {
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
                    try {
                        const response = await axios.get(`${API_BASE_URL}/animals/any/${sireId}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        setSireData(response.data);
                    } catch (e) {
                        console.warn('Failed to fetch sire data:', e.message);
                        setSireData(null);
                    }
                }

                if (damId) {
                    try {
                        const response = await axios.get(`${API_BASE_URL}/animals/any/${damId}`, {
                            headers: { Authorization: `Bearer ${authToken}` }
                        });
                        setDamData(response.data);
                    } catch (e) {
                        console.warn('Failed to fetch dam data:', e.message);
                        setDamData(null);
                    }
                }

                // Fetch offspring using dedicated endpoint
                try {
                    const offspringResponse = await axios.get(
                        `${API_BASE_URL}/animals/${animalToView.id_public}/offspring`,
                        {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }
                    );

                    const litters = offspringResponse.data || [];
                    // Flatten offspring from all litters into single array
                    const allOffspring = [];
                    litters.forEach(litter => {
                        if (litter.offspring && Array.isArray(litter.offspring)) {
                            allOffspring.push(...litter.offspring);
                        }
                    });

                    console.log('[PEDIGREE] Fetched offspring:', allOffspring.length, 'animals');
                    setOffspringData(allOffspring);
                } catch (e) {
                    console.log('[PEDIGREE] No offspring endpoint or no offspring found:', e.message);
                    setOffspringData([]);
                }
            } catch (error) {
                console.error('[PEDIGREE] Error fetching pedigree data:', error);
            }
        };

        fetchPedigreeData();
    }, [animalToView, authToken, API_BASE_URL]);

    /**
     * Listen for animal update events
     * Updates viewed animal if it was modified externally
     */
    useEffect(() => {
        const handleAnimalUpdated = (event: any) => {
            const updatedAnimal = event.detail;
            if (animalToView && updatedAnimal.id_public === animalToView.id_public) {
                // Merge updates into viewed animal
                setAnimalToView(prev => ({
                    ...prev,
                    ...updatedAnimal
                }));
            }
        };

        const handleAnimalArchived = (event: any) => {
            const archivedAnimalId = event.detail?.id_public;
            if (animalToView && archivedAnimalId === animalToView.id_public) {
                handleBackFromAnimal();
            }
        };

        window.addEventListener('animal-updated', handleAnimalUpdated);
        window.addEventListener('animal-archived', handleAnimalArchived);

        return () => {
            window.removeEventListener('animal-updated', handleAnimalUpdated);
            window.removeEventListener('animal-archived', handleAnimalArchived);
        };
    }, [animalToView, handleBackFromAnimal]);

    // ========== RETURN ALL STATE & HANDLERS ==========
    return {
        // View/Edit States
        animalToView,
        setAnimalToView,
        animalToEdit,
        setAnimalToEdit,
        animalViewHistory,
        setAnimalViewHistory,

        // Tab/Layout States
        privateAnimalInitialTab,
        setPrivateAnimalInitialTab,
        privateBetaView,
        setPrivateBetaView,
        detailViewTab,
        setDetailViewTab,

        // Related States
        speciesToAdd,
        setSpeciesToAdd,
        viewAnimalBreederInfo,
        setViewAnimalBreederInfo,
        parentCardKey,
        setParentCardKey,

        // Pedigree Data (fetched from API)
        sireData,
        setSireData,
        damData,
        setDamData,
        offspringData,
        setOffspringData,

        // Navigation Refs
        viewReturnPathRef,
        editReturnPathRef,

        // Handlers
        handleViewAnimal,
        handleEditAnimal,
        handleBackFromAnimal,
        handleCloseAllAnimals,
        handleSaveAnimal,
        handleArchiveAnimal,
        handleDeleteAnimal,
        toggleAnimalOwned,
        handleRestoreViewOnlyAnimal,
    };
}
