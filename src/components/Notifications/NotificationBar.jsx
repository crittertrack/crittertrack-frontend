import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
// We'll assume you have a central hook for authentication, like `useAuth`.
// If your app uses a different pattern, you can adapt this.
// Reverting to prop-based auth token to be consistent with other components.
// import { useAuth } from '../../contexts/AuthContext';
import { useUnreadMessages, useUnreadNotifications } from '../../hooks/useNotificationCounts';

const NotificationBar = ({ authToken, API_BASE_URL }) => {
  const { count: messageCount, isLoading: messagesLoading } = useUnreadMessages(authToken, API_BASE_URL);
  const { count: notificationCount, isLoading: notificationsLoading } = useUnreadNotifications(authToken, API_BASE_URL);
  
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
      <div className="bg-accent text-white text-sm py-1.5 px-4 w-full flex justify-center items-center gap-x-6 shadow-md">
        {notificationCount > 0 && (
          <Link to="/notifications" className="hover:underline font-semibold">
            ({notificationCount}) unread Notification{notificationCount > 1 ? 's' : ''}
          </Link>
        )}
        {messageCount > 0 && (
          <Link to="/messages" className="hover:underline font-semibold">
            ({messageCount}) unread Message{messageCount > 1 ? 's' : ''}
          </Link>
        )}
      </div>
    );
};

export default NotificationBar;