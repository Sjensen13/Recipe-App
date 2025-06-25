# User Data Storage Setup Guide

This guide explains how to set up user data storage in both Supabase's built-in auth system and your custom users table.

## Overview

The system now stores user data in two places:
1. **Supabase Auth** (`auth.users`) - Handles authentication, passwords, email verification
2. **Custom Users Table** (`public.users`) - Stores additional profile data like username, bio, avatar

## Setup Steps

### 1. Create Database Schema

Run the SQL commands in `docs/database/schema.sql` in your Supabase SQL editor:

```sql
-- Create the users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR UNIQUE,
  name VARCHAR NOT NULL,
  bio TEXT,
  avatar_url VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create other tables as needed...
```

### 2. Set Up Database Triggers

Run the SQL commands in `docs/database/triggers.sql` in your Supabase SQL editor:

```sql
-- This will automatically create/update/delete user records
-- in the custom users table when auth.users changes
```

### 3. Configure Row Level Security (RLS)

The triggers file includes RLS policies, but you can also set them up manually:

```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Allow public read access to basic user info
CREATE POLICY "Public can view basic user info" ON public.users
  FOR SELECT USING (true);
```

### 4. Update Environment Variables

Make sure your environment variables are set correctly:

**Client (.env):**
```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:5001/api
```

**Server (.env):**
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## How It Works

### Registration Flow

1. **User fills out registration form** with email, password, username, name
2. **Supabase Auth creates user** in `auth.users` table with metadata
3. **Database trigger fires** and creates record in `public.users` table
4. **Backup API call** ensures profile creation (in case trigger fails)
5. **User is logged in** and can access the app

### Data Storage

**In `auth.users` (Supabase Auth):**
- `id` - Unique user identifier
- `email` - User's email address
- `encrypted_password` - Hashed password
- `user_metadata` - JSON object with username, name, etc.
- `created_at`, `updated_at` - Timestamps

**In `public.users` (Custom Table):**
- `id` - References auth.users(id)
- `email` - User's email address
- `username` - Unique username
- `name` - Full name
- `bio` - User biography
- `avatar_url` - Profile picture URL
- `created_at`, `updated_at` - Timestamps

### Benefits

1. **Automatic Sync** - Database triggers ensure data consistency
2. **Flexible Queries** - Custom table allows complex queries and joins
3. **Security** - Supabase Auth handles authentication securely
4. **Scalability** - Can add custom fields without affecting auth
5. **Backup** - API endpoint provides fallback for profile creation

## Testing

### 1. Test Registration

1. Go to `/register` in your app
2. Fill out the form with test data
3. Submit the form
4. Check Supabase dashboard:
   - **Authentication > Users** - Should show new user
   - **Table Editor > users** - Should show new profile record

### 2. Test Login

1. Go to `/login`
2. Use the credentials from registration
3. Should successfully log in
4. Check that user data is available in both tables

### 3. Test Profile Updates

1. Update profile information
2. Check that both `auth.users.user_metadata` and `public.users` are updated

## Troubleshooting

### Common Issues

1. **"User not found in custom table"**
   - Check if database triggers are set up correctly
   - Verify RLS policies allow the operation
   - Check server logs for API errors

2. **"Duplicate key violation"**
   - Ensure username uniqueness constraints
   - Check if user already exists before creating

3. **"RLS policy violation"**
   - Verify RLS policies are set up correctly
   - Check that user is authenticated when making requests

### Debug Steps

1. **Check Supabase Dashboard:**
   - Authentication > Users
   - Table Editor > users
   - Logs > Database logs

2. **Check Application Logs:**
   - Client console for registration errors
   - Server logs for API errors

3. **Test Database Triggers:**
   ```sql
   -- Check if trigger exists
   SELECT * FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   
   -- Test trigger function
   SELECT handle_new_user();
   ```

## Migration from Existing Data

If you have existing users in Supabase Auth but not in the custom table:

```sql
-- Create profiles for existing users
INSERT INTO public.users (id, email, username, name, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  created_at,
  updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);
```

## Security Considerations

1. **RLS Policies** - Ensure proper access control
2. **Input Validation** - Validate all user inputs
3. **Rate Limiting** - Prevent abuse of registration endpoint
4. **Email Verification** - Consider enabling email confirmation
5. **Password Policies** - Enforce strong password requirements 