import React from 'react';
import { Link } from 'react-router-dom';
import { useUnreadMessages, useUnreadNotifications } from '../../hooks/useNotificationCounts';

const NotificationBar = ({ authToken, API_BASE_URL }) => {
  const { count: messageCount, isLoading: messagesLoading } = useUnreadMessages(authToken, API_BASE_URL);
  const { count: notificationCount, isLoading: notificationsLoading } = useUnreadNotifications(authToken, API_BASE_URL);

  const hasUnreadMessages = !messagesLoading && messageCount > 0;
  const hasUnreadNotifications = !notificationsLoading && notificationCount > 0;

  if (!hasUnreadMessages && !hasUnreadNotifications) {
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