# Recipes Database Setup

This guide explains how to set up the database tables for the recipe system.

## Database Schema

### 1. Recipes Table

```sql
-- Create recipes table
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  source VARCHAR(50) DEFAULT 'user', -- 'user' or 'spoonacular'
  external_url TEXT,
  nutrition JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better search performance
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_created_at ON recipes(created_at);
CREATE INDEX idx_recipes_title ON recipes USING gin(to_tsvector('english', title));
CREATE INDEX idx_recipes_description ON recipes USING gin(to_tsvector('english', description));
CREATE INDEX idx_recipes_ingredients ON recipes USING gin(ingredients);

-- Enable Row Level Security (RLS)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all recipes" ON recipes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON recipes
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. Recipe Likes Table

```sql
-- Create recipe likes table
CREATE TABLE recipe_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Create indexes
CREATE INDEX idx_recipe_likes_user_id ON recipe_likes(user_id);
CREATE INDEX idx_recipe_likes_recipe_id ON recipe_likes(recipe_id);

-- Enable RLS
ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all recipe likes" ON recipe_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own recipe likes" ON recipe_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipe likes" ON recipe_likes
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Recipe Comments Table

```sql
-- Create recipe comments table
CREATE TABLE recipe_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_recipe_comments_user_id ON recipe_comments(user_id);
CREATE INDEX idx_recipe_comments_recipe_id ON recipe_comments(recipe_id);
CREATE INDEX idx_recipe_comments_created_at ON recipe_comments(created_at);

-- Enable RLS
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all recipe comments" ON recipe_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own recipe comments" ON recipe_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipe comments" ON recipe_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipe comments" ON recipe_comments
  FOR DELETE USING (auth.uid() = user_id);
```

### 4. Recipe Collections Table (Optional)

```sql
-- Create recipe collections table for organizing recipes
CREATE TABLE recipe_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe collection items table
CREATE TABLE recipe_collection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES recipe_collections(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, recipe_id)
);

-- Create indexes
CREATE INDEX idx_recipe_collections_user_id ON recipe_collections(user_id);
CREATE INDEX idx_recipe_collection_items_collection_id ON recipe_collection_items(collection_id);
CREATE INDEX idx_recipe_collection_items_recipe_id ON recipe_collection_items(recipe_id);

-- Enable RLS
ALTER TABLE recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collection_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for collections
CREATE POLICY "Users can view public collections" ON recipe_collections
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own collections" ON recipe_collections
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for collection items
CREATE POLICY "Users can view collection items for accessible collections" ON recipe_collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipe_collections 
      WHERE id = collection_id 
      AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage items in their own collections" ON recipe_collection_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipe_collections 
      WHERE id = collection_id 
      AND user_id = auth.uid()
    )
  );
```

## Setup Instructions

### 1. Run the SQL Scripts

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Run the SQL scripts above in order
4. Verify the tables are created in the Table Editor

### 2. Test the Setup

You can test the setup by running these queries:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('recipes', 'recipe_likes', 'recipe_comments');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('recipes', 'recipe_likes', 'recipe_comments');
```

### 3. Environment Variables

Make sure you have these environment variables set in your server:

```env
# Google Vision API (for ingredient detection)
GOOGLE_VISION_API_KEY=your_google_vision_api_key
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key

# Spoonacular API (for external recipes)
SPOONACULAR_API_KEY=your_spoonacular_api_key
```

### 4. Test API Endpoints

After setting up the database, test these endpoints:

```bash
# Get recipe categories
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/recipes/categories

# Get recipe difficulties
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/recipes/difficulties

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
  http://localhost:5001/api/recipes
```

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Make sure you're authenticated when testing endpoints
2. **Foreign Key Errors**: Ensure the `auth.users` table exists and has data
3. **Permission Errors**: Check that your Supabase service role has the necessary permissions

### Useful Queries

```sql
-- Check recipe count
SELECT COUNT(*) FROM recipes;

-- Check recipes by user
SELECT r.title, u.username 
FROM recipes r 
JOIN auth.users u ON r.user_id = u.id;

-- Check RLS is working
SELECT * FROM recipes WHERE user_id = auth.uid();
```

## Next Steps

After setting up the database:

1. Test the recipe creation flow
2. Test the ingredient detection feature
3. Test the recipe search functionality
4. Add recipe detail pages
5. Implement social features (likes, comments) 