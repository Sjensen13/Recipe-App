# Notifications Database Setup

This guide explains how to set up the database tables for the notification system.

## Database Schema

### 1. Notifications Table

```sql
-- Create notifications table
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

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Allow system to create notifications for users
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);
```

### 2. Notification Types

The system supports the following notification types:

- `like` - When someone likes your post/recipe
- `comment` - When someone comments on your post/recipe
- `follow` - When someone follows you
- `message` - When someone sends you a message
- `recipe_match` - When a recipe matches your ingredients
- `mention` - When someone mentions you in a post/comment
- `recipe_shared` - When someone shares your recipe

### 3. Notification Data Structure

The `data` JSONB field can contain additional context:

```json
{
  "actor_id": "user-uuid",
  "actor_name": "John Doe",
  "actor_avatar": "https://...",
  "post_id": "post-uuid",
  "recipe_id": "recipe-uuid",
  "comment_id": "comment-uuid",
  "message_id": "message-uuid"
}
```

## Setup Instructions

### 1. Run the SQL Scripts

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Run the SQL script above
4. Verify the table is created in the Table Editor

### 2. Test the Setup

You can test the setup by running these queries:

```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'notifications';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'notifications';

-- Insert a test notification
INSERT INTO notifications (user_id, type, title, message, data)
VALUES (
  'your-user-id',
  'like',
  'New Like',
  'John Doe liked your recipe',
  '{"actor_id": "actor-uuid", "actor_name": "John Doe", "recipe_id": "recipe-uuid"}'
);
```

## Usage Examples

### Creating Notifications

```sql
-- Like notification
INSERT INTO notifications (user_id, type, title, message, data)
VALUES (
  'recipe-owner-id',
  'like',
  'New Like',
  'John Doe liked your recipe "Chocolate Cake"',
  '{"actor_id": "john-doe-id", "actor_name": "John Doe", "recipe_id": "recipe-id"}'
);

-- Comment notification
INSERT INTO notifications (user_id, type, title, message, data)
VALUES (
  'post-owner-id',
  'comment',
  'New Comment',
  'Jane Smith commented on your post',
  '{"actor_id": "jane-smith-id", "actor_name": "Jane Smith", "post_id": "post-id", "comment_id": "comment-id"}'
);

-- Follow notification
INSERT INTO notifications (user_id, type, title, message, data)
VALUES (
  'user-being-followed-id',
  'follow',
  'New Follower',
  'Alice Johnson started following you',
  '{"actor_id": "alice-johnson-id", "actor_name": "Alice Johnson"}'
);
```

### Querying Notifications

```sql
-- Get unread notifications for a user
SELECT * FROM notifications 
WHERE user_id = 'user-id' 
AND is_read = false 
ORDER BY created_at DESC;

-- Get all notifications for a user (paginated)
SELECT * FROM notifications 
WHERE user_id = 'user-id' 
ORDER BY created_at DESC 
LIMIT 20 OFFSET 0;

-- Get notification count by type
SELECT type, COUNT(*) as count 
FROM notifications 
WHERE user_id = 'user-id' 
AND is_read = false 
GROUP BY type;
```

## Performance Considerations

1. **Indexes**: The created indexes ensure fast queries for common operations
2. **Partitioning**: For high-volume apps, consider partitioning by date
3. **Cleanup**: Implement a cleanup job to remove old notifications
4. **Caching**: Consider caching notification counts for better performance

## Security

1. **RLS Policies**: Ensure users can only access their own notifications
2. **Input Validation**: Validate all notification data before insertion
3. **Rate Limiting**: Prevent notification spam
4. **Audit Trail**: Consider logging notification creation for debugging 