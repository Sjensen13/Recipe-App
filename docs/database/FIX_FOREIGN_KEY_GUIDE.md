# Fix Foreign Key Relationship Issue

## Problem
The error you're seeing indicates that Supabase can't find a relationship between the `recipes` and `users` tables:

```
Error fetching recipes: {
  code: 'PGRST200',
  details: "Searched for a foreign key relationship between 'recipes' and 'users' in the schema 'public', but no matches were found.",
  hint: null,
  message: "Could not find a relationship between 'recipes' and 'users' in the schema cache"
}
```

## Root Cause
The issue is that:
1. The `recipes` table references `auth.users(id)` (Supabase's built-in auth table)
2. But the code is trying to join with `users` table in the `public` schema
3. The foreign key relationship isn't properly established

## Solution

### Step 1: Run the Database Fix Script

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `docs/database/FIX_RECIPES_FOREIGN_KEY.sql`

This script will:
- Drop existing recipe tables (if they exist)
- Recreate them with proper foreign key relationships
- Set up Row Level Security (RLS) policies
- Create necessary indexes

### Step 2: Verify the Setup

After running the script, verify that:

1. **Tables exist:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('recipes', 'recipe_likes', 'recipe_comments');
```

2. **Foreign key relationships are correct:**
```sql
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('recipes', 'recipe_likes', 'recipe_comments');
```

3. **RLS policies are set up:**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('recipes', 'recipe_likes', 'recipe_comments');
```

### Step 3: Test the API

After fixing the database, test the API endpoints:

```bash
# Get all recipes
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/recipes

# Create a test recipe
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Recipe",
    "description": "A test recipe",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"],
    "cooking_time": 30,
    "difficulty": "easy",
    "servings": 4,
    "category": "main"
  }' \
  http://localhost:5000/api/recipes
```

## Code Changes Made

The following code changes have been made to fix the field name issue:

### 1. Recipe Controller (`server/src/controllers/recipes/index.js`)
- Changed `full_name` to `name` in user joins
- This matches the field name in the `public.users` table

### 2. Recipe Search Service (`server/src/services/ai/recipeSearch.js`)
- Changed `full_name` to `name` in user joins
- Updated all recipe search functions

## Database Schema

After running the fix script, your database will have:

### Recipes Table
```sql
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL,
  instructions TEXT[] NOT NULL,
  cooking_time INTEGER,
  difficulty VARCHAR(50) DEFAULT 'medium',
  servings INTEGER DEFAULT 1,
  category VARCHAR(50) DEFAULT 'main',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  source VARCHAR(50) DEFAULT 'user',
  external_url TEXT,
  nutrition JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Foreign Key Relationships
- `recipes.user_id` → `auth.users.id`
- `recipe_likes.user_id` → `auth.users.id`
- `recipe_likes.recipe_id` → `recipes.id`
- `recipe_comments.user_id` → `auth.users.id`
- `recipe_comments.recipe_id` → `recipes.id`

## Troubleshooting

### If you still get errors:

1. **Check if tables exist:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'recipes';
```

2. **Check foreign key constraints:**
```sql
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'recipes';
```

3. **Check RLS policies:**
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'recipes';
```

4. **Test with a simple query:**
```sql
SELECT * FROM recipes LIMIT 1;
```

### Common Issues:

1. **"Table doesn't exist"** - Run the fix script again
2. **"Permission denied"** - Check RLS policies
3. **"Foreign key violation"** - Ensure `auth.users` table has data
4. **"Column doesn't exist"** - Check that the `users` table has the correct column names

## Next Steps

After fixing the database:

1. Test the recipe creation flow
2. Test the recipe search functionality
3. Test the ingredient detection feature
4. Add recipe detail pages
5. Implement social features (likes, comments)

## Environment Variables

Make sure these are set in your server `.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

And in your client `.env`:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
``` 