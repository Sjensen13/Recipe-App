const axios = require('axios');
const { getSupabase } = require('../database');

// Initialize Spoonacular API client
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

/**
 * Search recipes by ingredients using Spoonacular API
 * @param {Array} ingredients - Array of ingredient names
 * @param {number} limit - Maximum number of recipes to return
 * @returns {Promise<Array>} Array of recipes
 */
const searchRecipesByIngredients = async (ingredients, limit = 10) => {
  try {
    if (!SPOONACULAR_API_KEY) {
      console.warn('Spoonacular API key not configured, falling back to local search');
      return await searchLocalRecipesByIngredients(ingredients, limit);
    }

    // Search both external and local recipes
    const [externalRecipes, localRecipes] = await Promise.all([
      searchExternalRecipesByIngredients(ingredients, limit),
      searchLocalRecipesByIngredients(ingredients, limit)
    ]);

    // Combine and deduplicate results
    const allRecipes = [...externalRecipes, ...localRecipes];
    const uniqueRecipes = deduplicateRecipes(allRecipes);

    // Sort by relevance (number of matching ingredients)
    const scoredRecipes = uniqueRecipes.map(recipe => ({
      ...recipe,
      relevanceScore: calculateRelevanceScore(recipe, ingredients)
    }));

    scoredRecipes.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return scoredRecipes.slice(0, limit);
  } catch (error) {
    console.error('Error searching recipes by ingredients:', error);
    // Fallback to local search
    return await searchLocalRecipesByIngredients(ingredients, limit);
  }
};

/**
 * Search recipes from Spoonacular API
 * @param {Array} ingredients - Array of ingredient names
 * @param {number} limit - Maximum number of recipes to return
 * @returns {Promise<Array>} Array of recipes
 */
const searchExternalRecipesByIngredients = async (ingredients, limit) => {
  try {
    const ingredientsString = ingredients.join(',');
    
    const response = await axios.get(`${SPOONACULAR_BASE_URL}/findByIngredients`, {
      params: {
        apiKey: SPOONACULAR_API_KEY,
        ingredients: ingredientsString,
        number: limit,
        ranking: 2, // Maximize used ingredients
        ignorePantry: true
      }
    });

    // Get detailed recipe information for each result
    const recipeIds = response.data.map(recipe => recipe.id);
    const detailedRecipes = await Promise.all(
      recipeIds.map(id => getExternalRecipeDetails(id))
    );

    return detailedRecipes.filter(recipe => recipe !== null);
  } catch (error) {
    console.error('Error searching external recipes:', error);
    return [];
  }
};

/**
 * Get detailed recipe information from Spoonacular
 * @param {number} recipeId - Spoonacular recipe ID
 * @returns {Promise<Object|null>} Recipe details
 */
const getExternalRecipeDetails = async (recipeId) => {
  try {
    const response = await axios.get(`${SPOONACULAR_BASE_URL}/${recipeId}/information`, {
      params: {
        apiKey: SPOONACULAR_API_KEY
      }
    });

    const recipe = response.data;
    
    return {
      id: `external_${recipe.id}`,
      title: recipe.title,
      description: recipe.summary.replace(/<[^>]*>/g, ''), // Remove HTML tags
      ingredients: recipe.extendedIngredients.map(ing => ing.original),
      instructions: recipe.analyzedInstructions[0]?.steps.map(step => step.step) || [],
      cooking_time: recipe.readyInMinutes,
      servings: recipe.servings,
      difficulty: getDifficultyFromTime(recipe.readyInMinutes),
      category: recipe.cuisines[0] || 'main',
      image_url: recipe.image,
      tags: [...(recipe.cuisines || []), ...(recipe.dishTypes || [])],
      source: 'spoonacular',
      external_url: recipe.sourceUrl,
      nutrition: recipe.nutrition?.nutrients || [],
      created_at: new Date().toISOString(),
      user: {
        id: 'external',
        username: 'spoonacular',
        full_name: 'Spoonacular',
        avatar_url: null
      }
    };
  } catch (error) {
    console.error(`Error getting recipe details for ID ${recipeId}:`, error);
    return null;
  }
};

/**
 * Search recipes from local database
 * @param {Array} ingredients - Array of ingredient names
 * @param {number} limit - Maximum number of recipes to return
 * @returns {Promise<Array>} Array of recipes
 */
const searchLocalRecipesByIngredients = async (ingredients, limit) => {
  const supabase = getSupabase();
  try {
    // Create search conditions for each ingredient
    const searchConditions = ingredients.map(ingredient => 
      `ingredients.ilike.%${ingredient}%`
    ).join(',');

    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        user:users(id, username, avatar_url, full_name)
      `)
      .or(searchConditions)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching local recipes:', error);
      return [];
    }

    return recipes || [];
  } catch (error) {
    console.error('Error searching local recipes:', error);
    return [];
  }
};

/**
 * Calculate relevance score for a recipe based on ingredient matches
 * @param {Object} recipe - Recipe object
 * @param {Array} searchIngredients - Array of search ingredients
 * @returns {number} Relevance score (0-1)
 */
const calculateRelevanceScore = (recipe, searchIngredients) => {
  const recipeIngredients = Array.isArray(recipe.ingredients) 
    ? recipe.ingredients 
    : [recipe.ingredients];

  const recipeIngredientText = recipeIngredients.join(' ').toLowerCase();
  const searchIngredientText = searchIngredients.join(' ').toLowerCase();

  let matches = 0;
  searchIngredients.forEach(ingredient => {
    if (recipeIngredientText.includes(ingredient.toLowerCase())) {
      matches++;
    }
  });

  return matches / searchIngredients.length;
};

/**
 * Deduplicate recipes based on title similarity
 * @param {Array} recipes - Array of recipes
 * @returns {Array} Deduplicated recipes
 */
const deduplicateRecipes = (recipes) => {
  const seen = new Set();
  return recipes.filter(recipe => {
    const title = recipe.title.toLowerCase().trim();
    if (seen.has(title)) {
      return false;
    }
    seen.add(title);
    return true;
  });
};

/**
 * Get difficulty level based on cooking time
 * @param {number} cookingTime - Cooking time in minutes
 * @returns {string} Difficulty level
 */
const getDifficultyFromTime = (cookingTime) => {
  if (cookingTime <= 15) return 'easy';
  if (cookingTime <= 45) return 'medium';
  if (cookingTime <= 90) return 'hard';
  return 'expert';
};

/**
 * Search recipes by name or description
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of recipes to return
 * @returns {Promise<Array>} Array of recipes
 */
const searchRecipesByName = async (query, limit = 10) => {
  const supabase = getSupabase();
  try {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(`
        *,
        user:users(id, username, avatar_url, full_name)
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching recipes by name:', error);
      return [];
    }

    return recipes || [];
  } catch (error) {
    console.error('Error searching recipes by name:', error);
    return [];
  }
};

/**
 * Get recipe recommendations based on user preferences
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of recipes to return
 * @returns {Promise<Array>} Array of recommended recipes
 */
const getRecipeRecommendations = async (userId, limit = 10) => {
  const supabase = getSupabase();
  try {
    // Get user's liked recipes to understand preferences
    const { data: likedRecipes, error: likedError } = await supabase
      .from('recipes')
      .select('category, tags, difficulty')
      .eq('user_id', userId)
      .limit(50);

    if (likedError) {
      console.error('Error getting user preferences:', likedError);
      return [];
    }

    // Extract common preferences
    const categories = [...new Set(likedRecipes.map(r => r.category))];
    const difficulties = [...new Set(likedRecipes.map(r => r.difficulty))];

    // Get recommended recipes based on preferences
    let query = supabase
      .from('recipes')
      .select(`
        *,
        user:users(id, username, avatar_url, full_name)
      `)
      .neq('user_id', userId) // Don't recommend user's own recipes
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters based on preferences
    if (categories.length > 0) {
      query = query.in('category', categories);
    }
    if (difficulties.length > 0) {
      query = query.in('difficulty', difficulties);
    }

    const { data: recipes, error } = await query;

    if (error) {
      console.error('Error getting recipe recommendations:', error);
      return [];
    }

    return recipes || [];
  } catch (error) {
    console.error('Error getting recipe recommendations:', error);
    return [];
  }
};

module.exports = {
  searchRecipesByIngredients,
  searchRecipesByName,
  getRecipeRecommendations,
  searchExternalRecipesByIngredients,
  searchLocalRecipesByIngredients
}; 