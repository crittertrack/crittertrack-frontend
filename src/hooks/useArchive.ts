import { useState, useCallback } from 'react';
import axios from 'axios';

// Define interfaces for better type safety
interface Animal {
    id_public: string;
    // Add other animal properties as they become relevant
    [key: string]: any;
}

/**
 * useArchive - Manages state and data fetching for the archive screen.
 * 
 * @param authToken - Current auth token for API calls
 * @param API_BASE_URL - API base URL
 * @returns Object with archive states and a function to fetch data.
 */
export function useArchive(authToken: string | null, API_BASE_URL: string) {
    const [archivedAnimals, setArchivedAnimals] = useState<Animal[]>([]);
    const [soldTransferredAnimals, setSoldTransferredAnimals] = useState<Animal[]>([]);
    const [archiveLoading, setArchiveLoading] = useState(false);

    const fetchArchiveData = useCallback(async () => {
        if (!authToken) return;
        setArchiveLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/animals/archived`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            const data = response.data || {};

            // Defensively handle cases where the API might return an object instead of an array
            const archived = Array.isArray(data.archived) ? data.archived : Object.values(data.archived || {});
            const soldTransferred = Array.isArray(data.soldTransferred) ? data.soldTransferred : Object.values(data.soldTransferred || {});

            setArchivedAnimals(archived as Animal[]);
            setSoldTransferredAnimals(soldTransferred as Animal[]);
        } catch (error) {
            console.error('Failed to fetch archive data:', error);
            setArchivedAnimals([]);
            setSoldTransferredAnimals([]);
        } finally {
            setArchiveLoading(false);
        }
    }, [authToken, API_BASE_URL]);

    return {
        archivedAnimals,
        soldTransferredAnimals,
        archiveLoading,
        fetchArchiveData,
    };
}