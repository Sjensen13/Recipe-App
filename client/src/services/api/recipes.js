import apiClient from './client';

/**
 * Create a new recipe
 * @param {Object} recipeData - Recipe data
 */
export const createRecipe = async (recipeData) => {
  try {
    const response = await apiClient.post('/recipes', recipeData);
    return response.data;
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw error;
  }
};

/**
 * Get all recipes with filters
 * @param {Object} params - Query parameters
 */
export const getRecipes = async (params = {}) => {
  try {
    const response = await apiClient.get('/recipes', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
};

/**
 * Get a single recipe by ID
 * @param {string} id - Recipe ID
 */
export const getRecipeById = async (id) => {
  try {
    const response = await apiClient.get(`/recipes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
};

/**
 * Update a recipe
 * @param {string} id - Recipe ID
 * @param {Object} recipeData - Updated recipe data
 */
export const updateRecipe = async (id, recipeData) => {
  try {
    const response = await apiClient.put(`/recipes/${id}`, recipeData);
    return response.data;
  } catch (error) {
    console.error('Error updating recipe:', error);
    throw error;
  }
};

/**
 * Delete a recipe
 * @param {string} id - Recipe ID
 */
export const deleteRecipe = async (id) => {
  try {
    const response = await apiClient.delete(`/recipes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    throw error;
  }
};

/**
 * Detect ingredients from image
 * @param {string} imageUrl - URL of the image
 */
export const detectIngredients = async (imageUrl) => {
  // Computer vision functionality is temporarily disabled
  return Promise.reject(new Error('Ingredient detection is disabled'));
};

/**
 * Search recipes by ingredients
 * @param {Array} ingredients - Array of ingredients
 * @param {number} limit - Maximum number of results
 */
export const searchByIngredients = async (ingredients, limit = 10) => {
  try {
    const response = await apiClient.post('/recipes/search-by-ingredients', {
      ingredients,
      limit
    });
    return response.data;
  } catch (error) {
    console.error('Error searching by ingredients:', error);
    throw error;
  }
};

/**
 * Get recipe categories
 */
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/recipes/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return a fallback value and indicate failure
    return { success: false, data: [] };
  }
};

/**
 * Get recipe difficulties
 */
export const getDifficulties = async () => {
  try {
    const response = await apiClient.get('/recipes/difficulties');
    return response.data;
  } catch (error) {
    console.error('Error fetching difficulties:', error);
    // Return a fallback value and indicate failure
    return { success: false, data: [] };
  }
}; 