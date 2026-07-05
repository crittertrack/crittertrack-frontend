import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useUnreadNotifications = (authToken, API_BASE_URL) => {
  const [data, setData] = useState({ count: 0, isLoading: true });

  const fetchCount = useCallback(async () => {
    // Don't fetch if required info is missing
    if (!authToken || !API_BASE_URL) {
      setData({ count: 0, isLoading: false });
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setData({ count: response.data?.count || 0, isLoading: false });
    } catch (error) {
      // Silently fail, as this is a non-critical UI element
      console.error('Failed to fetch notification count:', error);
      setData({ count: 0, isLoading: false });
    }
  }, [authToken, API_BASE_URL]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000); // Poll every 60 seconds

    return () => clearInterval(interval);
  }, [fetchCount]);

  return { ...data, refetch: fetchCount };
};

export const useUnreadMessages = (authToken, API_BASE_URL) => {
    const [data, setData] = useState({ count: 0, adminCount: 0, isLoading: true });

    const fetchCount = useCallback(async () => {
        // Don't fetch if required info is missing
        if (!authToken || !API_BASE_URL) {
            setData({ count: 0, adminCount: 0, isLoading: false });
            return;
        }

        try {
            // Assuming an endpoint that returns a simple count object: { count: 5 }
            const response = await axios.get(`${API_BASE_URL}/messages/unread-count`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const responseData = response.data || {};
            let count = 0;
            if (typeof responseData.count === 'number') {
                count = responseData.count;
            } else if (typeof responseData === 'number') {
                count = responseData;
            }
            const adminCount = responseData.adminCount || 0;
            setData({ count: count, adminCount: adminCount, isLoading: false });
        } catch (error) {
            // Silently fail as this is not a critical feature.
            console.error('Failed to fetch message count:', error);
            setData({ count: 0, adminCount: 0, isLoading: false });
        }
    }, [authToken, API_BASE_URL]);

    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 60000); // Poll every 60 seconds

        return () => clearInterval(interval);
    }, [fetchCount]);

    return { ...data, refetch: fetchCount };
};