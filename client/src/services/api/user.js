import apiClient from './client';

export const userService = {
  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  },

  // Get user by ID (if needed)
  getUserById: async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Follow a user
  followUser: async (userId) => {
    const response = await apiClient.post(`/users/${userId}/follow`);
    return response.data;
  },

  // Unfollow a user
  unfollowUser: async (userId) => {
    const response = await apiClient.delete(`/users/${userId}/follow`);
    return response.data;
  },

  // Get followers count
  getFollowersCount: async (userId) => {
    const response = await apiClient.get(`/users/${userId}/followers`);
    return response.data;
  },

  // Get following count
  getFollowingCount: async (userId) => {
    const response = await apiClient.get(`/users/${userId}/following`);
    return response.data;
  },

  // Get followers list with pagination
  getFollowersList: async (userId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/users/${userId}/followers/list`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Get following list with pagination
  getFollowingList: async (userId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/users/${userId}/following/list`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Check if current user is following another user
  checkIsFollowing: async (userId) => {
    const response = await apiClient.get(`/users/${userId}/is-following`);
    return response.data;
  }
}; 