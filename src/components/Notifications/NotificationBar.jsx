import React from 'react';
import { Link } from 'react-router-dom';
// We'll assume you have a central hook for authentication, like `useAuth`.
// If your app uses a different pattern, you can adapt this.
import { useAuth } from '../../contexts/AuthContext'; // This is an example path
import { useUnreadMessages, useUnreadNotifications } from '../../hooks/useNotificationCounts';

const NotificationBar = ({ API_BASE_URL }) => {
  // Use a hook to get the auth token directly from context.
  // The `|| {}` prevents errors if the context isn't ready.
  const { token: authToken } = useAuth() || {};
  const { count: messageCount, isLoading: messagesLoading } = useUnreadMessages(authToken, API_BASE_URL);
  const { count: notificationCount, isLoading: notificationsLoading } = useUnreadNotifications(authToken, API_BASE_URL);

  const hasUnreadMessages = !messagesLoading && messageCount > 0;
  const hasUnreadNotifications = !notificationsLoading && notificationCount > 0;

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