import apiClient from './client';

/**
 * General search across all types
 * @param {string} query - Search query
 * @param {string} type - Search type ('all', 'posts', 'users', 'hashtags')
 * @param {Object} params - Additional parameters
 */
export const search = async (query, type = 'all', params = {}) => {
  try {
    const response = await apiClient.get('/search', {
      params: { q: query, type, ...params }
    });
    return response.data;
  } catch (error) {
    console.error('Error performing search:', error);
    throw error;
  }
};

/**
 * Search posts
 * @param {string} query - Search query
 * @param {Object} params - Additional parameters
 */
export const searchPosts = async (query, params = {}) => {
  try {
    const response = await apiClient.get('/search/posts', {
      params: { q: query, ...params }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching posts:', error);
    throw error;
  }
};

/**
 * Search users
 * @param {string} query - Search query
 * @param {Object} params - Additional parameters
 */
export const searchUsers = async (query, params = {}) => {
  try {
    const response = await apiClient.get('/search/users', {
      params: { q: query, ...params }
  });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

/**
 * Search hashtags
 * @param {string} query - Search query
 * @param {Object} params - Additional parameters
 */
export const searchHashtags = async (query, params = {}) => {
  try {
    const response = await apiClient.get('/search/hashtags', {
      params: { q: query, ...params }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching hashtags:', error);
    throw error;
  }
};

/**
 * Get popular hashtags
 * @param {Object} params - Additional parameters
 */
export const getPopularHashtags = async (params = {}) => {
  try {
    const response = await apiClient.get('/search/popular-hashtags', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular hashtags:', error);
    throw error;
  }
};

/**
 * Search recipes
 * @param {string} query - Search query
 * @param {Object} params - Additional parameters
 */
export const searchRecipes = async (query, params = {}) => {
  try {
    const response = await apiClient.get('/search/recipes', {
      params: { q: query, ...params }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
}; 