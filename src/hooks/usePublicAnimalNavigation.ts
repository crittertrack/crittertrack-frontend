import { useState, useCallback, useEffect } from 'react';

/**
 * usePublicAnimalNavigation - Manages public (non-owned) animal viewing navigation
 * 
 * Features:
 * - View public animals discovered through search/directory
 * - Navigation history stack for back/forward without URL routing
 * - Tab management for animal detail view
 * - Auto-clear history when all animals are closed
 * 
 * @returns Object with public animal states and navigation handlers
 */
export function usePublicAnimalNavigation() {
    // ========== PUBLIC ANIMAL VIEWING STATES ==========
    const [viewingPublicAnimal, setViewingPublicAnimal] = useState(null);
    const [publicAnimalViewHistory, setPublicAnimalViewHistory] = useState([]);
    const [publicAnimalInitialTab, setPublicAnimalInitialTab] = useState(1);

    // ========== HANDLER FUNCTIONS ==========

    /**
     * View a public animal - adds to history stack
     * Called when user clicks on a public animal result
     */
    const handleViewPublicAnimal = useCallback((animal) => {
        if (!animal) return;

        // Add current animal to history before viewing new one
        if (viewingPublicAnimal) {
            setPublicAnimalViewHistory(prev => [...prev, viewingPublicAnimal]);
        }

        // Set the new animal to view
        setViewingPublicAnimal(animal);
    }, [viewingPublicAnimal]);

    /**
     * Go back to previous animal in history stack
     * Pops from history or closes view if no history
     */
    const handleBackFromPublicAnimal = useCallback(() => {
        if (publicAnimalViewHistory.length > 0) {
            // Pop from history
            const newHistory = [...publicAnimalViewHistory];
            const previousAnimal = newHistory.pop();
            setPublicAnimalViewHistory(newHistory);
            setViewingPublicAnimal(previousAnimal);
        } else {
            // No history - close view
            setViewingPublicAnimal(null);
        }
    }, [publicAnimalViewHistory]);

    /**
     * Close all public animal views and clear history
     * Called when user closes the public animal view modal completely
     */
    const handleCloseAllPublicAnimals = useCallback(() => {
        setViewingPublicAnimal(null);
        setPublicAnimalViewHistory([]);
    }, []);

    // ========== EFFECTS ==========

    /**
     * Clear history when all public animals are closed
     */
    useEffect(() => {
        if (!viewingPublicAnimal) {
            setPublicAnimalViewHistory([]);
        }
    }, [viewingPublicAnimal]);

    // ========== RETURN ALL STATE & HANDLERS ==========
    return {
        // States
        viewingPublicAnimal,
        setViewingPublicAnimal,
        publicAnimalViewHistory,
        setPublicAnimalViewHistory,
        publicAnimalInitialTab,
        setPublicAnimalInitialTab,

        // Handlers
        handleViewPublicAnimal,
        handleBackFromPublicAnimal,
        handleCloseAllPublicAnimals,
    };
}
