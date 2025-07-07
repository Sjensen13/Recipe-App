# Notification System Implementation

## Overview

The notification system provides real-time notifications for user interactions in the Recipe Social App. It supports various notification types including likes, comments, follows, messages, recipe matches, and mentions.

## Features

### Core Functionality
- **Real-time Notifications**: Instant notification delivery for user interactions
- **Multiple Notification Types**: Support for likes, comments, follows, messages, recipe matches, and mentions
- **Read/Unread Tracking**: Mark notifications as read individually or all at once
- **Notification Management**: Delete notifications and filter by status
- **Badge Display**: Unread notification count displayed in navigation
- **Pagination**: Load notifications in batches for better performance

### Notification Types

1. **Like Notifications** - When someone likes your post/recipe
2. **Comment Notifications** - When someone comments on your post/recipe
3. **Follow Notifications** - When someone follows you
4. **Message Notifications** - When someone sends you a message
5. **Recipe Match Notifications** - When a recipe matches your ingredients
6. **Mention Notifications** - When someone mentions you in a post/comment
7. **Recipe Shared Notifications** - When someone shares your recipe

## Technical Implementation

### Backend (Node.js/Express)

#### Database Schema
```sql
-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

#### API Endpoints
- `GET /api/notifications` - Get all notifications for user (with pagination)
- `GET /api/notifications/unread-count` - Get unread notification count
- `PUT /api/notifications/:id/read` - Mark specific notification as read
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete a notification

#### Controllers
- **Notification Controller** (`server/src/controllers/notifications/index.js`)
  - CRUD operations for notifications
  - Helper functions for creating specific notification types
  - Pagination and filtering support

#### Integration Points
- **Posts Controller**: Creates notifications for likes and comments
- **Messages Controller**: Creates notifications for new messages
- **Users Controller**: Creates notifications for follows (when implemented)
- **Recipes Controller**: Creates notifications for recipe matches and shares

### Frontend (React)

#### Components
- **NotificationItem** (`client/src/components/notifications/NotificationItem.jsx`)
  - Individual notification display
  - Click handling and navigation
  - Delete functionality
  - Read/unread status indicators

- **NotificationsList** (`client/src/components/notifications/NotificationsList.jsx`)
  - List of notifications with filtering
  - Pagination support
  - Mark all as read functionality
  - Empty state handling

#### Hooks
- **useNotifications** (`client/src/hooks/useNotifications.js`)
  - State management for notifications
  - API integration
  - Real-time updates (polling)
  - Pagination handling

#### API Service
- **notifications.js** (`client/src/services/api/notifications.js`)
  - API client functions
  - Error handling
  - Response formatting

## Usage Examples

### Creating Notifications

```javascript
// Like notification
await createLikeNotification(
  postOwnerId,
  actorId,
  actorName,
  postId,
  postTitle
);

// Comment notification
await createCommentNotification(
  postOwnerId,
  actorId,
  actorName,
  postId,
  commentId,
  commentContent
);

// Message notification
await createMessageNotification(
  receiverId,
  actorId,
  actorName,
  messageId,
  messagePreview
);
```

### Frontend Usage

```javascript
import useNotifications from '../hooks/useNotifications';

const MyComponent = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationById
  } = useNotifications();

  return (
    <NotificationsList
      notifications={notifications}
      loading={loading}
      onMarkAsRead={markNotificationAsRead}
      onDelete={deleteNotificationById}
      onMarkAllAsRead={markAllNotificationsAsRead}
    />
  );
};
```

## Notification Data Structure

```javascript
{
  id: "uuid",
  user_id: "user-uuid",
  type: "like|comment|follow|message|recipe_match|mention|recipe_shared",
  title: "New Like",
  message: "John Doe liked your post",
  data: {
    actor_id: "actor-uuid",
    actor_name: "John Doe",
    actor_avatar: "https://...",
    post_id: "post-uuid",
    recipe_id: "recipe-uuid",
    comment_id: "comment-uuid",
    message_id: "message-uuid"
  },
  is_read: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}
```

## Navigation Integration

The notification system integrates with the main navigation to display unread counts:

```javascript
// Layout component shows notification badge
const { unreadCount } = useNotifications();

// Badge display in navigation
{unreadCount > 0 && (
  <span className="notification-badge">
    {unreadCount > 9 ? '9+' : unreadCount}
  </span>
)}
```

## Performance Considerations

### Backend
- **Indexes**: Proper database indexing for fast queries
- **Pagination**: Load notifications in batches (20 per page)
- **Polling**: 30-second intervals for unread count updates
- **Caching**: Consider Redis for high-traffic scenarios

### Frontend
- **Lazy Loading**: Load notifications on demand
- **Optimistic Updates**: Immediate UI updates for better UX
- **Debouncing**: Prevent excessive API calls
- **Memory Management**: Clean up old notifications

## Security Features

### Authentication
- All notification endpoints require authentication
- Users can only access their own notifications
- Proper authorization checks for all operations

### Data Validation
- Input validation for all notification data
- SQL injection prevention through parameterized queries
- XSS protection through proper data sanitization

### Rate Limiting
- API rate limiting to prevent abuse
- Notification creation limits to prevent spam

## Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for instant notifications
- **Push Notifications**: Browser and mobile push notifications
- **Email Notifications**: Email alerts for important notifications
- **Notification Preferences**: User-configurable notification settings
- **Notification Groups**: Group similar notifications together

### Technical Improvements
- **WebSocket Integration**: Real-time notification delivery
- **Push Service**: Integration with Firebase Cloud Messaging
- **Email Service**: SendGrid or similar for email notifications
- **Advanced Filtering**: Filter by type, date, and content
- **Notification Templates**: Dynamic notification content

## Testing

### Backend Testing
```javascript
// Test notification creation
const notification = await createLikeNotification(
  'user-id',
  'actor-id',
  'John Doe',
  'post-id',
  'Post Title'
);
expect(notification.success).toBe(true);
```

### Frontend Testing
```javascript
// Test notification hook
const { notifications, unreadCount } = useNotifications();
expect(notifications).toBeDefined();
expect(typeof unreadCount).toBe('number');
```

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check database triggers and RLS policies
   - Verify notification creation in controller logs
   - Ensure user authentication is working

2. **Badge count not updating**
   - Check polling interval in useNotifications hook
   - Verify API endpoint responses
   - Clear browser cache and reload

3. **Performance issues**
   - Check database indexes
   - Implement pagination if not already done
   - Consider caching for high-traffic scenarios

### Debug Steps

1. **Check Database**
   ```sql
   SELECT * FROM notifications WHERE user_id = 'your-user-id' ORDER BY created_at DESC;
   ```

2. **Check API Logs**
   - Monitor server logs for notification creation
   - Verify API endpoint responses

3. **Check Frontend**
   - Open browser dev tools
   - Check network tab for API calls
   - Verify React component state

## Deployment

### Database Setup
1. Run the SQL scripts in `docs/database/NOTIFICATIONS_SETUP.md`
2. Verify table creation and indexes
3. Test RLS policies

### Backend Deployment
1. Ensure notification routes are registered in `server/src/index.js`
2. Test notification creation endpoints
3. Monitor server logs for errors

### Frontend Deployment
1. Verify notification components are imported correctly
2. Test notification display and interactions
3. Check badge display in navigation

## Monitoring

### Key Metrics
- Notification creation rate
- Read/unread ratios
- API response times
- Error rates

### Logging
- Notification creation events
- API endpoint usage
- Error tracking
- Performance metrics

This notification system provides a robust foundation for user engagement and can be extended with additional features as the application grows. 