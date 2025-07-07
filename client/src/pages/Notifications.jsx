import React from 'react';
import useNotifications from '../hooks/useNotifications';
import NotificationsList from '../components/notifications/NotificationsList';

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationById,
    loadMore,
    refresh
  } = useNotifications();

  const handleNavigate = (notification) => {
    // Custom navigation logic can be added here if needed
    // The default navigation is handled in NotificationItem
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <NotificationsList
        notifications={notifications}
        loading={loading}
        error={error}
        onMarkAsRead={markNotificationAsRead}
        onDelete={deleteNotificationById}
        onMarkAllAsRead={markAllNotificationsAsRead}
        onNavigate={handleNavigate}
        pagination={pagination}
        onLoadMore={loadMore}
      />
    </div>
  );
};

export default Notifications; 