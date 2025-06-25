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
  }
}; 