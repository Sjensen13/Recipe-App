# Supabase Authentication Setup

This document explains how the Recipe App has been updated to use Supabase's built-in authentication system with dual user storage.

## Changes Made

### Client-Side Changes

1. **AuthContext.jsx** - Updated to use Supabase auth and create custom user profiles
2. **Login.jsx** - Changed from username to email-based login
3. **Register.jsx** - Updated to work with Supabase registration
4. **ForgotPassword.jsx** - New component for password reset
5. **App.jsx** - Added forgot password route
6. **API Client** - New service for making authenticated API requests

### Server-Side Changes

1. **Auth Middleware** - Updated to verify Supabase tokens
2. **Auth Controller** - Simplified to work with Supabase user data and custom profiles
3. **Auth Routes** - Added profile creation endpoint
4. **Database Triggers** - Automatic user profile creation

## Dual User Storage System

The app now uses a dual storage approach:

### 1. Supabase Auth (`auth.users`)
- Handles authentication, passwords, email verification
- Stores core user data and metadata
- Managed by Supabase automatically

### 2. Custom Users Table (`public.users`)
- Stores additional profile data (username, bio, avatar, etc.)
- Allows complex queries and joins with other tables
- Automatically synced via database triggers

## Supabase Setup Required

### 1. Enable Email Authentication

1. Go to your Supabase dashboard
2. Navigate to Authentication > Settings
3. Enable "Email" provider
4. **Important**: Disable "Confirm email" for development (or handle email confirmation)

### 2. Create Database Schema

Run the SQL commands in `docs/database/schema.sql` in your Supabase SQL editor to create the users table and other required tables.

### 3. Set Up Database Triggers

Run the SQL commands in `docs/database/triggers.sql` in your Supabase SQL editor. This will:
- Automatically create user profiles when users register
- Keep user data in sync between auth.users and public.users
- Handle user updates and deletions

### 4. Configure Row Level Security (RLS)

The triggers file includes RLS policies, but ensure they're properly set up:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policy for users to insert their own data
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow public read access to basic user info
CREATE POLICY "Public can view basic user info" ON users
  FOR SELECT USING (true);
```

### 5. Configure Email Templates (Optional)

1. Go to Authentication > Email Templates
2. Customize the email templates for:
   - Confirm signup
   - Reset password
   - Magic link

## Environment Variables

### Client (.env)
```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:5001/api
```

### Server (.env)
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## How It Works

### Authentication Flow

1. **Registration**: User fills out form → Supabase creates account → Database trigger creates profile → User data stored in both tables
2. **Login**: User enters email/password → Supabase validates → Returns session with access token
3. **API Requests**: Client automatically includes access token in Authorization header
4. **Server Verification**: Server uses Supabase service key to verify tokens

### User Data Storage

- **Core user data** (email, password, etc.) is stored in Supabase's `auth.users` table
- **Additional profile data** (username, bio, avatar, etc.) is stored in `public.users` table
- **Automatic sync** via database triggers ensures data consistency
- **Backup API endpoint** provides fallback for profile creation

## Testing

### 1. Register a New User
- Go to `/register`
- Fill out the form with email, password, username, and name
- User should be created in both Supabase auth and custom users table

### 2. Login
- Go to `/login`
- Use the email and password from registration
- Should successfully log in and redirect to home

### 3. Check User Data
- Verify user exists in Authentication > Users
- Verify profile exists in Table Editor > users
- Check that data is consistent between both tables

### 4. Password Reset
- Go to `/forgot-password`
- Enter email address
- Check email for reset link

## Benefits of This Setup

1. **Security**: Built-in security best practices from Supabase Auth
2. **Flexibility**: Custom table allows complex queries and additional fields
3. **Automatic Sync**: Database triggers ensure data consistency
4. **Scalability**: Can add custom fields without affecting auth
5. **Maintenance**: No need to manage JWT tokens manually
6. **Integration**: Seamless integration with Supabase database

## Troubleshooting

### Common Issues

1. **"User not found in custom table"**
   - Check if database triggers are set up correctly
   - Verify RLS policies allow the operation
   - Check server logs for API errors

2. **"Invalid login credentials"**
   - Check if user exists in Supabase auth
   - Verify email confirmation is disabled or handled

3. **"Missing Supabase environment variables"**
   - Ensure all environment variables are set correctly
   - Restart the development server

4. **"Token verification failed"**
   - Check if service key is correct
   - Verify token format in Authorization header

5. **"Duplicate key violation"**
   - Ensure username uniqueness constraints
   - Check if user already exists before creating

### Debug Tips

1. Check Supabase dashboard for user creation in both tables
2. Use browser dev tools to inspect network requests
3. Check server logs for authentication errors
4. Verify environment variables are loaded correctly
5. Test database triggers manually in SQL editor

## Migration from Existing Data

If you have existing users in Supabase Auth but not in the custom table, run this SQL:

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

1. **RLS Policies** - Ensure proper access control on custom tables
2. **Input Validation** - Validate all user inputs on both client and server
3. **Rate Limiting** - Prevent abuse of registration and profile endpoints
4. **Email Verification** - Consider enabling email confirmation for production
5. **Password Policies** - Enforce strong password requirements
6. **Service Key Security** - Keep service key secure and never expose it to client 