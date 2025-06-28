# Follows Table Setup Guide

This guide explains how to set up the follows table for user following functionality.

## Overview

The follows table tracks relationships between users who follow each other. It's a many-to-many relationship table that connects followers to users they follow.

## Database Schema

### 1. Create the Follows Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create the follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate follows
  UNIQUE(follower_id, following_id)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON public.follows(created_at);
```

### 2. Configure Row Level Security (RLS)

```sql
-- Enable RLS on follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all follow relationships (for public profiles)
CREATE POLICY "Public can view follows" ON public.follows
  FOR SELECT USING (true);

-- Policy: Users can create follow relationships
CREATE POLICY "Users can follow others" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Policy: Users can unfollow (delete their own follows)
CREATE POLICY "Users can unfollow" ON public.follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Policy: Users can update their own follows (if needed)
CREATE POLICY "Users can update own follows" ON public.follows
  FOR UPDATE USING (auth.uid() = follower_id);
```

## How It Works

### Table Structure

- **`id`** - Unique identifier for the follow relationship
- **`follower_id`** - ID of the user who is following (references users.id)
- **`following_id`** - ID of the user being followed (references users.id)
- **`created_at`** - Timestamp when the follow relationship was created
- **`UNIQUE(follower_id, following_id)`** - Prevents duplicate follows

### Relationships

- **One user can follow many other users** (one-to-many from follower perspective)
- **One user can be followed by many other users** (one-to-many from following perspective)
- **This creates a many-to-many relationship** between users

### Example Data

```sql
-- User A follows User B
INSERT INTO follows (follower_id, following_id) 
VALUES ('user-a-uuid', 'user-b-uuid');

-- User A follows User C
INSERT INTO follows (follower_id, following_id) 
VALUES ('user-a-uuid', 'user-c-uuid');

-- User B follows User A
INSERT INTO follows (follower_id, following_id) 
VALUES ('user-b-uuid', 'user-a-uuid');
```

## API Endpoints

The follows table supports these API endpoints:

### Follow a User
```
POST /api/users/:userId/follow
Authorization: Bearer <token>
```

### Unfollow a User
```
DELETE /api/users/:userId/follow
Authorization: Bearer <token>
```

### Get Followers Count
```
GET /api/users/:userId/followers
```

### Get Following Count
```
GET /api/users/:userId/following
```

### Check if Following
```
GET /api/users/:userId/is-following
Authorization: Bearer <token>
```

## Testing

### 1. Test Follow Creation

```sql
-- Check if follows table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'follows';

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'follows';
```

### 2. Test Follow Relationships

```sql
-- Create test users (if they don't exist)
INSERT INTO users (id, email, name) VALUES 
('test-user-1', 'user1@test.com', 'Test User 1'),
('test-user-2', 'user2@test.com', 'Test User 2')
ON CONFLICT (id) DO NOTHING;

-- Create a follow relationship
INSERT INTO follows (follower_id, following_id) 
VALUES ('test-user-1', 'test-user-2');

-- Check the relationship
SELECT 
  f.id,
  u1.name as follower_name,
  u2.name as following_name,
  f.created_at
FROM follows f
JOIN users u1 ON f.follower_id = u1.id
JOIN users u2 ON f.following_id = u2.id;
```

### 3. Test API Endpoints

1. **Follow a user** through the app interface
2. **Check followers count** on user profiles
3. **Test unfollow** functionality
4. **Verify follow status** is displayed correctly

## Troubleshooting

### Common Issues

1. **"Table 'follows' does not exist"**
   - Run the CREATE TABLE SQL command
   - Check if you're in the correct database schema

2. **"Foreign key constraint violation"**
   - Ensure both users exist in the users table
   - Check that user IDs are valid UUIDs

3. **"Duplicate key violation"**
   - The UNIQUE constraint prevents following the same user twice
   - This is expected behavior

4. **"RLS policy violation"**
   - Ensure user is authenticated when making follow requests
   - Check that RLS policies are set up correctly

### Debug Steps

1. **Check table existence:**
   ```sql
   SELECT * FROM follows LIMIT 1;
   ```

2. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'follows';
   ```

3. **Test follow creation manually:**
   ```sql
   INSERT INTO follows (follower_id, following_id) 
   VALUES ('your-user-id', 'other-user-id');
   ```

4. **Check server logs** for specific error messages

## Performance Considerations

### Indexes

The created indexes help with:
- **`idx_follows_follower_id`** - Fast queries for "who is this user following"
- **`idx_follows_following_id`** - Fast queries for "who follows this user"
- **`idx_follows_created_at`** - Fast sorting by follow date

### Query Optimization

For large datasets, consider:
- Pagination for followers/following lists
- Caching follower counts
- Denormalization for frequently accessed data

## Security Considerations

1. **RLS Policies** - Ensure proper access control
2. **Input Validation** - Validate user IDs on both client and server
3. **Rate Limiting** - Prevent abuse of follow/unfollow endpoints
4. **Self-Follow Prevention** - Server validates follower_id ≠ following_id
5. **Duplicate Prevention** - Database constraint prevents duplicate follows 