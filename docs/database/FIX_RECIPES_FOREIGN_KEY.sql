-- Fix Recipes Foreign Key Relationship
-- This script fixes the foreign key relationship between recipes and users tables

-- First, check if the recipes table exists and its current structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'recipes'
ORDER BY ordinal_position;

-- Check if the foreign key constraint exists
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

-- Drop the recipes table if it exists (this will also drop any foreign key constraints)
DROP TABLE IF EXISTS recipe_likes CASCADE;
DROP TABLE IF EXISTS recipe_comments CASCADE;
DROP TABLE IF EXISTS recipe_collection_items CASCADE;
DROP TABLE IF EXISTS recipe_collections CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;

-- Recreate the recipes table with proper foreign key relationship
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
  source VARCHAR(50) DEFAULT 'user', -- 'user' or 'spoonacular'
  external_url TEXT,
  nutrition JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
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

-- Create recipe likes table
CREATE TABLE recipe_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Create indexes for recipe_likes
CREATE INDEX idx_recipe_likes_user_id ON recipe_likes(user_id);
CREATE INDEX idx_recipe_likes_recipe_id ON recipe_likes(recipe_id);

-- Enable RLS on recipe_likes
ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recipe_likes
CREATE POLICY "Users can view all recipe likes" ON recipe_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own recipe likes" ON recipe_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipe likes" ON recipe_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create recipe comments table
CREATE TABLE recipe_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for recipe_comments
CREATE INDEX idx_recipe_comments_user_id ON recipe_comments(user_id);
CREATE INDEX idx_recipe_comments_recipe_id ON recipe_comments(recipe_id);
CREATE INDEX idx_recipe_comments_created_at ON recipe_comments(created_at);

-- Enable RLS on recipe_comments
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recipe_comments
CREATE POLICY "Users can view all recipe comments" ON recipe_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own recipe comments" ON recipe_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipe comments" ON recipe_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipe comments" ON recipe_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Verify the foreign key relationships
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
    AND tc.table_name IN ('recipes', 'recipe_likes', 'recipe_comments')
ORDER BY tc.table_name, kcu.column_name;

-- Test the setup by inserting a sample recipe (optional)
-- INSERT INTO recipes (user_id, title, description, ingredients, instructions, cooking_time, difficulty, servings, category)
-- VALUES (
--   (SELECT id FROM auth.users LIMIT 1),
--   'Test Recipe',
--   'A test recipe to verify the setup',
--   ARRAY['ingredient 1', 'ingredient 2'],
--   ARRAY['step 1', 'step 2'],
--   30,
--   'easy',
--   4,
--   'main'
-- ); 