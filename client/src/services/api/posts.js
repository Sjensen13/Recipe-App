import apiClient from './client';

/**
 * Get all posts with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Posts per page
 * @param {string} params.userId - Filter by user ID
 */
export const getPosts = async (params = {}) => {
  try {
    const response = await apiClient.get('/posts', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

/**
 * Get single post by ID
 * @param {string} postId - Post ID
 */
export const getPost = async (postId) => {
  try {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

/**
 * Create new post
 * @param {Object} postData - Post data
 * @param {string} postData.title - Post title
 * @param {string} postData.content - Post content
 * @param {string} postData.image_url - Image URL (optional)
 * @param {Object} postData.recipe_data - Recipe data (optional)
 * @param {string[]} postData.hashtags - Hashtags (optional)
 */
export const createPost = async (postData) => {
  try {
    const response = await apiClient.post('/posts', postData);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

/**
 * Update post
 * @param {string} postId - Post ID
 * @param {Object} postData - Updated post data
 */
export const updatePost = async (postId, postData) => {
  try {
    const response = await apiClient.put(`/posts/${postId}`, postData);
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

/**
 * Delete post
 * @param {string} postId - Post ID
 */
export const deletePost = async (postId) => {
  try {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

/**
 * Get user posts
 * @param {string} userId - User ID
 * @param {Object} params - Query parameters
 */
export const getUserPosts = async (userId, params = {}) => {
  try {
    const response = await apiClient.get('/posts', {
      params: { ...params, userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

// Like or unlike a post
export const likePost = async (postId) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (postId, content) => {
  try {
    const response = await apiClient.post(`/posts/${postId}/comments`, { content });
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}; 