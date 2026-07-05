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

  const hasUnreadMessages = !messagesLoading && messageCount > 0;
  const hasUnreadNotifications = !notificationsLoading && notificationCount > 0;

  // This useEffect hook is for debugging. It will log the component's state to the browser console.
  useEffect(() => {
    console.log('[Debug] NotificationBar State:', {
      authToken: authToken ? 'Provided' : 'MISSING',
      API_BASE_URL: API_BASE_URL ? 'Provided' : 'MISSING',
      messages: { loading: messagesLoading, count: messageCount },
      notifications: { loading: notificationsLoading, count: notificationCount },
      shouldRenderBar: !!authToken && (hasUnreadMessages || hasUnreadNotifications),
    });
  }, [authToken, API_BASE_URL, messagesLoading, messageCount, notificationsLoading, notificationCount, hasUnreadMessages, hasUnreadNotifications]);

  // Also ensure there's an auth token before trying to render.
  if (!authToken || (!hasUnreadMessages && !hasUnreadNotifications)) {
    return null;
  }

  return (
    <div className="bg-accent text-white text-sm py-1.5 px-4 w-full flex justify-center items-center gap-x-6 shadow-md">
      {hasUnreadNotifications && (
        <Link to="/notifications" className="hover:underline font-semibold">
          ({notificationCount}) unread Notification{notificationCount > 1 ? 's' : ''}
        </Link>
      )}
      {hasUnreadMessages && (
        <Link to="/messages" className="hover:underline font-semibold">
          ({messageCount}) unread Message{messageCount > 1 ? 's' : ''}
        </Link>
      )}
    </div>
  );
};

export default NotificationBar;