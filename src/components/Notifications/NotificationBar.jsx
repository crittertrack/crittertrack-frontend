import React, { useEffect } from 'react';
import { useUnreadMessages, useUnreadNotifications } from '../../hooks/useNotificationCounts';

const NotificationBar = ({ authToken, API_BASE_URL, setShowNotifications, setShowMessages }) => {
  const { count: totalMessageCount, adminCount, isLoading: messagesLoading, refetch: refetchMessages } = useUnreadMessages(authToken, API_BASE_URL);
  const { count: notificationCount, isLoading: notificationsLoading, refetch: refetchNotifications } = useUnreadNotifications(authToken, API_BASE_URL);
  
  useEffect(() => {
    const handleNotificationsChanged = () => {
      if (refetchMessages) refetchMessages();
      if (refetchNotifications) refetchNotifications();
    };
    window.addEventListener('notifications-changed', handleNotificationsChanged);
    return () => window.removeEventListener('notifications-changed', handleNotificationsChanged);
  }, [refetchMessages, refetchNotifications]);

  const regularMessageCount = totalMessageCount > adminCount ? totalMessageCount - adminCount : 0;
  const isUrgent = adminCount > 0;
  const isLoading = messagesLoading || notificationsLoading;
  
  // Wait for both counts to load. Only render if there is a token and at least one unread item.
  if (isLoading || !authToken || (totalMessageCount === 0 && notificationCount === 0)) {
    return null;
  }
  
  const barItems = [];

  if (isUrgent) {
    barItems.push(
      <button
        key="admin-messages"
        onClick={() => {
          if (setShowMessages) setShowMessages(true);
          refetchMessages();
        }}
        className="hover:underline font-semibold"
      >
        ({adminCount}) unread message{adminCount > 1 ? 's' : ''} from CritterTrack
      </button>
    );
  }

  if (notificationCount > 0) {
    barItems.push(
      <button
        key="notifications"
        onClick={() => {
          if (setShowNotifications) setShowNotifications(true);
          refetchNotifications();
        }}
        className="hover:underline font-semibold"
      >
        ({notificationCount}) unread Notification{notificationCount > 1 ? 's' : ''}
      </button>
    );
  }

  if (regularMessageCount > 0) {
    barItems.push(
      <button
        key="regular-messages"
        onClick={() => {
          if (setShowMessages) setShowMessages(true);
          refetchMessages();
        }}
        className="hover:underline font-semibold"
      >
        ({regularMessageCount}) unread Message{regularMessageCount > 1 ? 's' : ''}
      </button>
    );
  }

  if (barItems.length === 0) return null;

  const bgColor = isUrgent ? 'bg-red-600' : 'bg-purple-600';
  const separatorColor = isUrgent ? 'text-red-300' : 'text-purple-300';

  return (
    <div className={`${bgColor} text-white text-sm py-1.5 px-4 flex justify-center items-center gap-x-4 shadow-md rounded-lg`}>
      {barItems.map((item, index) => (
        <React.Fragment key={item.key}>
          {item}
          {index < barItems.length - 1 && (
            <span className={`${separatorColor} opacity-50`}>|</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default NotificationBar;