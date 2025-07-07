# Recipe App Setup Guide

## Issues Found and Solutions

### 1. Missing Environment Configuration
**Problem**: Your app is trying to connect to a non-existent Supabase project (`kaagnxjnybbrsgazlltp.supabase.co`)

**Solution**: You need to set up a Supabase project and configure the environment variables.

### 2. Server Port Mismatch
**Problem**: Client was trying to connect to port 5001, but server runs on 5000

**Solution**: ✅ Fixed - Updated client configuration to use port 5000

### 3. Authentication Issues
**Problem**: Recipe creation was failing because authentication middleware was disabled

**Solution**: ✅ Fixed - Enabled authentication middleware

## Setup Steps

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - Name: "Recipe App" (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose closest to you
6. Click "Create new project"
7. Wait for the project to be created (this may take a few minutes)

### Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-ref.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### Step 3: Configure Client Environment

1. Open `client/.env`
2. Replace the placeholder values with your actual Supabase credentials:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5001/api

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_actual_anon_key_here

# External APIs (optional)
REACT_APP_GOOGLE_VISION_API_KEY=your_google_vision_api_key
REACT_APP_SPOONACULAR_API_KEY=your_spoonacular_api_key

# Optional: Cloudinary for image storage
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Step 4: Configure Server Environment

1. Open `server/.env`
2. Replace the placeholder values:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration (Supabase)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random

# External APIs (optional)
GOOGLE_VISION_API_KEY=your_google_vision_api_key
SPOONACULAR_API_KEY=your_spoonacular_api_key

# File Storage (Cloudinary - Optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Important**: For the server, you need the **Service Role Key** (not the anon key). You can find this in your Supabase dashboard under Settings → API → Project API keys → `service_role` key.

### Step 5: Set Up Database Tables

1. In your Supabase dashboard, go to SQL Editor
2. Run the following SQL to create the necessary tables:

```sql
-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR UNIQUE,
  name VARCHAR,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  ingredients TEXT[],
  instructions TEXT[],
  cooking_time INTEGER,
  difficulty VARCHAR DEFAULT 'medium',
  servings INTEGER DEFAULT 1,
  category VARCHAR DEFAULT 'main',
  tags TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read all users
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Recipes policies
CREATE POLICY "Anyone can read recipes" ON recipes FOR SELECT USING (true);
CREATE POLICY "Users can create recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON recipes FOR DELETE USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Anyone can read posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Anyone can read follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can create follows" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete own follows" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Likes policies
CREATE POLICY "Anyone can read likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can read their messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their messages" ON messages FOR UPDATE USING (auth.uid() = sender_id);
CREATE POLICY "Users can delete their messages" ON messages FOR DELETE USING (auth.uid() = sender_id);
```

### Step 6: Start the Application

1. **Start the server**:
   ```bash
   cd server
   npm install
   npm start
   ```

2. **Start the client** (in a new terminal):
   ```bash
   cd client
   npm install
   npm start
   ```

### Step 7: Test the Application

1. Open your browser to `http://localhost:3000`
2. Try to register a new account
3. Try to create a recipe
4. Check the browser console for any remaining errors

## Troubleshooting

### If you still see Supabase connection errors:
1. Double-check your Supabase URL and keys in the `.env` files
2. Make sure you're using the correct keys (anon key for client, service role key for server)
3. Verify your Supabase project is active

### If recipe creation still fails:
1. Check the server logs for detailed error messages
2. Verify the database tables were created successfully
3. Check that the authentication is working properly

### If you need help:
1. Check the browser console for error messages
2. Check the server terminal for error logs
3. Verify all environment variables are set correctly

## Next Steps

Once the basic setup is working:
1. Set up Cloudinary for image uploads (optional)
2. Configure external APIs (Google Vision, Spoonacular) for enhanced features
3. Customize the UI and add more features

Let me know if you encounter any issues during setup! 