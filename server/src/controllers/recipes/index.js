const { getSupabase } = require('../../services/database');
const { searchRecipesByIngredients, searchRecipesByNameOrIngredients } = require('../../services/ai/recipeSearch');

/**
 * Create a new recipe
 * POST /api/recipes
 */
const createRecipe = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { title, description, ingredients, instructions, cooking_time, difficulty, servings, category, tags, image_url } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !ingredients || !instructions) {
      return res.status(400).json({
        success: false,
        message: 'Title, ingredients, and instructions are required'
      });
    }

    // Create recipe
    const { data: recipe, error } = await supabase
      .from('recipes')
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description?.trim() || '',
        ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
        instructions: Array.isArray(instructions) ? instructions : [instructions],
        cooking_time: cooking_time || null,
        difficulty: difficulty || 'medium',
        servings: servings || 1,
        category: category || 'main',
        tags: tags || [],
        image_url: image_url || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating recipe:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create recipe'
      });
    }

    res.status(201).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all recipes with pagination and filters
 * GET /api/recipes
 */
const getRecipes = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      ingredients = '',
    } = req.query;

    // Parse ingredients as array (comma-separated or array)
    let ingredientsArr = [];
    if (Array.isArray(ingredients)) {
      ingredientsArr = ingredients;
    } else if (typeof ingredients === 'string' && ingredients.trim() !== '') {
      ingredientsArr = ingredients.split(',').map(s => s.trim()).filter(Boolean);
    }

    let recipes = [];
    
    if (search.trim() || ingredientsArr.length > 0) {
      // Use the new combined search function when there's a search query
      console.log('Searching recipes with query:', search, 'ingredients:', ingredientsArr);
      recipes = await searchRecipesByNameOrIngredients(search, ingredientsArr, parseInt(limit));
      console.log('Search results:', recipes.length);
    } else {
      // Get all recipes when no search is provided
      console.log('Fetching all recipes');
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('recipes')
        .select('*');

      if (error) {
        console.error('Error fetching recipes:', error);
        throw new Error('Failed to fetch recipes');
      }
      
      console.log('Fetched recipes:', data ? data.length : 0);
      recipes = data || [];
    }

    res.json({
      success: true,
      data: recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: recipes.length
      }
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get a single recipe by ID
 * GET /api/recipes/:id
 */
const getRecipeById = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { id } = req.params;

    const { data: recipe, error } = await supabase
      .from('recipes')
      .select(`
        *,
        user:users(id, username, avatar_url, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Recipe not found'
        });
      }
      console.error('Error fetching recipe:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch recipe'
      });
    }

    res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update a recipe
 * PUT /api/recipes/:id
 */
const updateRecipe = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if recipe exists and user owns it
    const { data: existingRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Recipe not found'
        });
      }
      console.error('Error fetching recipe:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch recipe'
      });
    }

    if (existingRecipe.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own recipes'
      });
    }

    // Update recipe
    const { data: recipe, error } = await supabase
      .from('recipes')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating recipe:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update recipe'
      });
    }

    res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete a recipe
 * DELETE /api/recipes/:id
 */
const deleteRecipe = async (req, res) => {
  const supabase = getSupabase();
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if recipe exists and user owns it
    const { data: existingRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Recipe not found'
        });
      }
      console.error('Error fetching recipe:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch recipe'
      });
    }

    if (existingRecipe.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own recipes'
      });
    }

    // Delete recipe
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recipe:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete recipe'
      });
    }

    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Detect ingredients from image
 * POST /api/recipes/detect-ingredients
 */
// Commented out: const detectIngredients = async (req, res) => {
// Commented out:   try {
// Commented out:     const { image_url } = req.body;
// Commented out:
// Commented out:     if (!image_url) {
// Commented out:       return res.status(400).json({
// Commented out:         success: false,
// Commented out:         message: 'Image URL is required'
// Commented out:       });
// Commented out:     }
// Commented out:
// Commented out:     const ingredients = await detectIngredientsFromImage(image_url);
// Commented out:
// Commented out:     res.json({
// Commented out:       success: true,
// Commented out:       data: {
// Commented out:         ingredients,
// Commented out:         count: ingredients.length
// Commented out:       }
// Commented out:     });
// Commented out:   } catch (error) {
// Commented out:     console.error('Detect ingredients error:', error);
// Commented out:     res.status(500).json({
// Commented out:       success: false,
// Commented out:       message: 'Failed to detect ingredients from image'
// Commented out:     });
// Commented out:   }
// Commented out: };

/**
 * Search recipes by ingredients
 * POST /api/recipes/search-by-ingredients
 */
const searchByIngredients = async (req, res) => {
  try {
    const { ingredients, limit = 10 } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ingredients array is required'
      });
    }

    const recipes = await searchRecipesByIngredients(ingredients, limit);

    res.json({
      success: true,
      data: recipes
    });
  } catch (error) {
    console.error('Search by ingredients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search recipes by ingredients'
    });
  }
};

/**
 * Get recipe categories
 * GET /api/recipes/categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = [
      { id: 'breakfast', name: 'Breakfast', icon: '🌅' },
      { id: 'lunch', name: 'Lunch', icon: '🍽️' },
      { id: 'dinner', name: 'Dinner', icon: '🌙' },
      { id: 'dessert', name: 'Dessert', icon: '🍰' },
      { id: 'snack', name: 'Snack', icon: '🍿' },
      { id: 'beverage', name: 'Beverage', icon: '🥤' },
      { id: 'appetizer', name: 'Appetizer', icon: '🥗' },
      { id: 'soup', name: 'Soup', icon: '🍲' },
      { id: 'salad', name: 'Salad', icon: '🥬' },
      { id: 'main', name: 'Main Course', icon: '🍖' }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get recipe difficulties
 * GET /api/recipes/difficulties
 */
const getDifficulties = async (req, res) => {
  try {
    const difficulties = [
      { id: 'easy', name: 'Easy', icon: '😊' },
      { id: 'medium', name: 'Medium', icon: '😐' },
      { id: 'hard', name: 'Hard', icon: '😰' },
      { id: 'expert', name: 'Expert', icon: '👨‍🍳' }
    ];

    res.json({
      success: true,
      data: difficulties
    });
  } catch (error) {
    console.error('Get difficulties error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  // Commented out: detectIngredients,
  searchByIngredients,
  getCategories,
  getDifficulties
}; 