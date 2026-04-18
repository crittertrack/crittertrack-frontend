import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * useBreedingLines - Manages color-coded breeding line definitions and animal assignments
 * 
 * Features:
 * - Define up to 10 named breeding lines with custom colors
 * - Assign animals to breeding lines for visual tracking
 * - Sync with backend (overrides localStorage)
 * - Persist in localStorage as fallback
 * - Auto-sync on logout (clears cache)
 * 
 * @param authToken - Current auth token for API calls
 * @param API_BASE_URL - API base URL
 * @returns Object with breeding line states and handlers
 */
export function useBreedingLines(authToken: string | null, API_BASE_URL: string) {
    // ========== BREEDING LINE PRESETS (COLOR PALETTE) ==========
    const BL_PRESETS_APP = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b'];

    // ========== BREEDING LINE DEFINITIONS ==========
    const [breedingLineDefs, setBreedingLineDefs] = useState(() => {
        try {
            const stored = localStorage.getItem('ct_bldefs');
            if (stored) return JSON.parse(stored);
        } catch (e) {
            console.warn('[BREEDING LINES] Failed to parse breeding line defs from localStorage:', e);
        }
        // Default: 10 empty definitions with preset colors
        return Array.from({ length: 10 }, (_, i) => ({ id: i, name: '', color: BL_PRESETS_APP[i] }));
    });

    // ========== ANIMAL BREEDING LINE ASSIGNMENTS ==========
    const [animalBreedingLines, setAnimalBreedingLines] = useState(() => {
        try {
            const stored = localStorage.getItem('ct_blassign');
            if (stored) return JSON.parse(stored);
        } catch (e) {
            console.warn('[BREEDING LINES] Failed to parse animal assignments from localStorage:', e);
        }
        // Default: empty assignments
        return {};
    });

    // ========== REF FOR LATEST DEFS (AVOIDS STALE CLOSURES) ==========
    const breedingLineDefsRef = useRef(breedingLineDefs);
    useEffect(() => {
        breedingLineDefsRef.current = breedingLineDefs;
    }, [breedingLineDefs]);

    // ========== LOAD FROM BACKEND ON LOGIN ==========
    useEffect(() => {
        if (!authToken) return;

        const loadBreedingLinesFromBackend = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/breeding-lines`, {
                    headers: { Authorization: `Bearer ${authToken}` }
                });

                console.log('[BREEDING LINES] Loaded from backend');

                // Always overwrite from backend - even empty arrays clear stale data from previous user
                const defs =
                    Array.isArray(response.data.breedingLineDefs) && response.data.breedingLineDefs.length > 0
                        ? response.data.breedingLineDefs
                        : Array.from({ length: 10 }, (_, i) => ({ id: i, name: '', color: BL_PRESETS_APP[i] }));

                setBreedingLineDefs(defs);
                try {
                    localStorage.setItem('ct_bldefs', JSON.stringify(defs));
                } catch (e) {
                    console.warn('[BREEDING LINES] Failed to save defs to localStorage:', e);
                }

                // Load assignments
                const assign =
                    response.data.animalBreedingLines && typeof response.data.animalBreedingLines === 'object'
                        ? response.data.animalBreedingLines
                        : {};

                setAnimalBreedingLines(assign);
                try {
                    localStorage.setItem('ct_blassign', JSON.stringify(assign));
                } catch (e) {
                    console.warn('[BREEDING LINES] Failed to save assignments to localStorage:', e);
                }
            } catch (error) {
                console.warn('[BREEDING LINES] Failed to load from backend:', error.message);
                // Silent fail - use localStorage fallback already loaded
            }
        };

        loadBreedingLinesFromBackend();
    }, [authToken, API_BASE_URL]);

    // ========== HANDLER FUNCTIONS ==========

    /**
     * Save breeding line definitions
     * Updates state, localStorage, and backend
     */
    const saveBreedingLineDefs = useCallback(
        (defs, currentAssignments) => {
            setBreedingLineDefs(defs);
            try {
                localStorage.setItem('ct_bldefs', JSON.stringify(defs));
            } catch (e) {
                console.warn('[BREEDING LINES] Failed to save defs to localStorage:', e);
            }

            if (authToken) {
                return axios
                    .put(
                        `${API_BASE_URL}/users/breeding-lines`,
                        {
                            breedingLineDefs: defs,
                            animalBreedingLines: currentAssignments
                        },
                        {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }
                    )
                    .catch(err => {
                        console.error('[BREEDING LINES] Failed to save defs to backend:', err);
                    });
            }
            return Promise.resolve();
        },
        [authToken, API_BASE_URL]
    );

    /**
     * Toggle breeding line assignment for an animal
     * Adds or removes animal from specified breeding line
     */
    const toggleAnimalBreedingLine = useCallback(
        (animalId, lineId) => {
            const current = animalBreedingLines[animalId] || [];
            const updated = current.includes(lineId) ? current.filter(id => id !== lineId) : [...current, lineId];
            const next = { ...animalBreedingLines, [animalId]: updated };

            setAnimalBreedingLines(next);
            try {
                localStorage.setItem('ct_blassign', JSON.stringify(next));
            } catch (e) {
                console.warn('[BREEDING LINES] Failed to save assignments to localStorage:', e);
            }

            if (authToken) {
                axios
                    .put(
                        `${API_BASE_URL}/users/breeding-lines`,
                        {
                            breedingLineDefs: breedingLineDefsRef.current,
                            animalBreedingLines: next
                        },
                        {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }
                    )
                    .catch(err => console.error('[BREEDING LINES] Failed to save assignment to backend:', err));
            }
        },
        [animalBreedingLines, authToken, API_BASE_URL]
    );

    /**
     * Update a breeding line definition (name/color)
     */
    const updateBreedingLineDef = useCallback(
        (lineId, name, color) => {
            const updated = breedingLineDefs.map(line =>
                line.id === lineId ? { ...line, name, color } : line
            );
            saveBreedingLineDefs(updated, animalBreedingLines);
        },
        [breedingLineDefs, animalBreedingLines, saveBreedingLineDefs]
    );

    /**
     * Clear all breeding line assignments for an animal
     */
    const clearAnimalBreedingLines = useCallback(
        (animalId) => {
            const next = { ...animalBreedingLines };
            delete next[animalId];
            setAnimalBreedingLines(next);
            try {
                localStorage.setItem('ct_blassign', JSON.stringify(next));
            } catch (e) {
                console.warn('[BREEDING LINES] Failed to clear assignments:', e);
            }

            if (authToken) {
                axios
                    .put(
                        `${API_BASE_URL}/users/breeding-lines`,
                        {
                            breedingLineDefs: breedingLineDefsRef.current,
                            animalBreedingLines: next
                        },
                        {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }
                    )
                    .catch(err => console.error('[BREEDING LINES] Failed to clear assignments:', err));
            }
        },
        [animalBreedingLines, authToken, API_BASE_URL]
    );

    /**
     * Directly set all breeding line IDs for an animal (bulk replace, not toggle)
     * Used for parent inheritance
     */
    const setAnimalBreedingLinesDirect = useCallback(
        (animalId: string, lineIds: number[]) => {
            const next = { ...animalBreedingLines, [animalId]: lineIds };
            setAnimalBreedingLines(next);
            try {
                localStorage.setItem('ct_blassign', JSON.stringify(next));
            } catch (e) {
                console.warn('[BREEDING LINES] Failed to save direct assignment to localStorage:', e);
            }

            if (authToken) {
                axios
                    .put(
                        `${API_BASE_URL}/users/breeding-lines`,
                        {
                            breedingLineDefs: breedingLineDefsRef.current,
                            animalBreedingLines: next
                        },
                        {
                            headers: { Authorization: `Bearer ${authToken}` }
                        }
                    )
                    .catch(err => console.error('[BREEDING LINES] Failed to save direct assignment:', err));
            }
        },
        [animalBreedingLines, authToken, API_BASE_URL]
    );

    // ========== RETURN ALL STATE & HANDLERS ==========
    return {
        // Definitions and Assignments
        breedingLineDefs,
        setBreedingLineDefs,
        animalBreedingLines,
        setAnimalBreedingLines,

        // Color Presets
        BL_PRESETS_APP,

        // Handlers
        saveBreedingLineDefs,
        toggleAnimalBreedingLine,
        updateBreedingLineDef,
        clearAnimalBreedingLines,
        setAnimalBreedingLinesDirect,

        // Ref
        breedingLineDefsRef,
    };
}
