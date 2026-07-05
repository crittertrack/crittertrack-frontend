import { useState, useEffect } from 'react';
import axios from 'axios';

export const useUnreadNotifications = (authToken, API_BASE_URL) => {
  const [data, setData] = useState({ count: 0, isLoading: true });

  useEffect(() => {
    // Don't fetch if required info is missing
    if (!authToken || !API_BASE_URL) {
      setData({ count: 0, isLoading: false });
      return;
    }

    const fetchCount = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/notifications`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        // Handle both array response and object response { notifications: [...] }
        const notifications = Array.isArray(response.data) ? response.data : response.data?.notifications || [];
        // Count notifications that are 'pending' and not general broadcasts
        const pendingNotifications = notifications.filter(
          (n) => n.status === 'pending' && n.type !== 'broadcast' && n.type !== 'announcement' && n.type !== 'moderator_message'
        );
        setData({ count: pendingNotifications.length, isLoading: false });
      } catch (error) {
        // Silently fail, as this is a non-critical UI element
        console.error('Failed to fetch notification count:', error);
        setData({ count: 0, isLoading: false });
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60000); // Poll every 60 seconds

    return () => clearInterval(interval);
  }, [authToken, API_BASE_URL]);

  return data;
};

export const useUnreadMessages = (authToken, API_BASE_URL) => {
    const [data, setData] = useState({ count: 0, isLoading: true });

    useEffect(() => {
        // Don't fetch if required info is missing
        if (!authToken || !API_BASE_URL) {
            setData({ count: 0, isLoading: false });
            return;
        }

        const fetchCount = async () => {
            try {
                // Assuming an endpoint that returns a simple count object: { count: 5 }
                const response = await axios.get(`${API_BASE_URL}/messages/unread-count`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                // Handle different possible response shapes: { count: 5 } or just 5
                let count = 0;
                if (response.data) {
                    if (typeof response.data.count === 'number') {
                        count = response.data.count;
                    } else if (typeof response.data === 'number') {
                        count = response.data;
                    }
                }
                setData({ count: count, isLoading: false });
            } catch (error) {
                // Silently fail as this is not a critical feature.
                console.error('Failed to fetch message count:', error);
                setData({ count: 0, isLoading: false });
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 60000); // Poll every 60 seconds

        return () => clearInterval(interval);
    }, [authToken, API_BASE_URL]);

    return data;
};