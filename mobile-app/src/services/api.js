import axios from 'axios';

// Create axios instance
export const apiClient = axios.create({
  baseURL: 'http://192.168.0.35:5001/api', // Use computer's IP address for mobile devices
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get the current token from the API client defaults
    const currentToken = apiClient.defaults.headers.common['Authorization'];
    
    // Always ensure Authorization header is set
    if (!config.headers.Authorization) {
      if (currentToken) {
        // Use the real token set by AuthContext
        config.headers.Authorization = currentToken;
      } else {
        // Fall back to mock token for development
        config.headers.Authorization = 'Bearer mock_jwt_token_development';
      }
    }
    
    // For FormData requests, don't set Content-Type manually
    // Let React Native handle it automatically with the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    console.log('Request headers:', config.headers);
    console.log('Request data type:', config.data ? config.data.constructor.name : 'undefined');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
};

export const postsAPI = {
  getPosts: () => apiClient.get('/posts'),
  getPost: (id) => apiClient.get(`/posts/${id}`),
  createPost: (postData) => apiClient.post('/posts', postData),
  updatePost: (id, postData) => apiClient.put(`/posts/${id}`, postData),
  deletePost: (id) => apiClient.delete(`/posts/${id}`),
  likePost: (id) => apiClient.post(`/posts/${id}/like`),
  unlikePost: (id) => apiClient.delete(`/posts/${id}/like`),
};

export const usersAPI = {
  getProfile: (id) => apiClient.get(`/users/${id}`),
  updateProfile: (userData) => apiClient.put('/auth/profile', userData),
  followUser: (id) => apiClient.post(`/users/${id}/follow`),
  unfollowUser: (id) => apiClient.delete(`/users/${id}/follow`),
  getFollowers: (id) => apiClient.get(`/users/${id}/followers`),
  getFollowing: (id) => apiClient.get(`/users/${id}/following`),
};

export const recipesAPI = {
  searchRecipes: (query) => apiClient.get('/recipes/search', { params: query }),
  getRecipe: (id) => apiClient.get(`/recipes/${id}`),
  createRecipe: (recipeData) => apiClient.post('/recipes', recipeData),
  updateRecipe: (id, recipeData) => apiClient.put(`/recipes/${id}`, recipeData),
  deleteRecipe: (id) => apiClient.delete(`/recipes/${id}`),
};

export const messagesAPI = {
  getConversations: () => apiClient.get('/messages/conversations'),
  getMessages: (conversationId) => apiClient.get(`/messages/${conversationId}`),
  sendMessage: (conversationId, message) => apiClient.post(`/messages/${conversationId}`, message),
  createConversation: (userId) => apiClient.post('/messages/conversations', { userId }),
};

export const notificationsAPI = {
  getNotifications: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/read-all'),
};

export const uploadAPI = {
  uploadImage: (formData) => {
    console.log('=== UPLOAD API CALLED ===');
    console.log('FormData received:', formData);
    console.log('FormData type:', formData.constructor.name);
    
    // For FormData in React Native, we need to let the client set the Content-Type automatically
    // Setting it manually can interfere with the boundary parameter
    return apiClient.post('/upload/image', formData, {
      transformRequest: (data) => {
        console.log('Transform request called with:', data);
        console.log('Data type:', data ? data.constructor.name : 'undefined');
        // Don't transform FormData - let it be sent as-is
        return data;
      },
    });
  },
}; 