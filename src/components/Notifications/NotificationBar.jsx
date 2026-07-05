import React, { useEffect } from 'react';
import { useUnreadMessages, useUnreadNotifications } from '../../hooks/useNotificationCounts';

const NotificationBar = ({ authToken, API_BASE_URL, setShowNotifications, setShowMessages }) => {
  const { count: messageCount, isLoading: messagesLoading, refetch: refetchMessages } = useUnreadMessages(authToken, API_BASE_URL);
  const { count: notificationCount, isLoading: notificationsLoading, refetch: refetchNotifications } = useUnreadNotifications(authToken, API_BASE_URL);
  
    const isLoading = messagesLoading || notificationsLoading;
  
    // This useEffect hook is for debugging. It will log the component's state to the browser console.
    useEffect(() => {
      console.log('[Debug] NotificationBar State:', {
        authToken: authToken ? 'Provided' : 'MISSING',
        API_BASE_URL: API_BASE_URL ? 'Provided' : 'MISSING',
        isLoading,
        messages: { loading: messagesLoading, count: messageCount },
        notifications: { loading: notificationsLoading, count: notificationCount },
      });
    }, [authToken, API_BASE_URL, isLoading, messagesLoading, messageCount, notificationsLoading, notificationCount]);
  
    // Wait for both counts to load to prevent the bar from appearing and disappearing.
    // Only render if there is a token and at least one unread item.
    if (isLoading || !authToken || (messageCount === 0 && notificationCount === 0)) {
      return null;
    }
  
    return (
      <div className="bg-purple-600 text-white text-sm py-1.5 px-4 flex justify-center items-center gap-x-6 shadow-md rounded-lg">
        {notificationCount > 0 && (
          <button
            onClick={() => {
              if (setShowNotifications) setShowNotifications(true);
              refetchNotifications();
            }}
            className="hover:underline font-semibold"
          >
            ({notificationCount}) unread Notification{notificationCount > 1 ? 's' : ''}
          </button>
        )}
        {messageCount > 0 && (
          <button
            onClick={() => {
              if (setShowMessages) setShowMessages(true);
              refetchMessages();
            }}
            className="hover:underline font-semibold"
          >
            ({messageCount}) unread Message{messageCount > 1 ? 's' : ''}
          </button>
        )}
      </div>
    );
};

export default NotificationBar;