import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearStoredAuth = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
      delete apiClient.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Error clearing stored auth:', error);
    }
  };

  const login = async (usernameOrEmail, password) => {
    try {
      let email = usernameOrEmail;
      
      // If the input doesn't look like an email, treat it as a username
      if (!usernameOrEmail.includes('@')) {
        console.log('[Mobile Auth] Looking up email for username:', usernameOrEmail);
        try {
          const response = await apiClient.post('/auth/get-email-by-username', { 
            username: usernameOrEmail 
          });
          
          if (response.data.success) {
            email = response.data.email;
            console.log('[Mobile Auth] Found email for username:', email);
          } else {
            throw new Error('Invalid username or password');
          }
        } catch (lookupError) {
          console.error('[Mobile Auth] Username lookup failed:', lookupError);
          throw new Error('Invalid username or password');
        }
      }

      console.log('[Mobile Auth] Attempting login with email:', email);
      
      // Use the server's authentication endpoint
      const response = await apiClient.post('/auth/login', {
        email: email,
        password: password,
      });

      const { token: authToken, user: userData } = response.data;

      setToken(authToken);
      setUser(userData);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Log the token after setting it
      console.log('JWT TOKEN:', authToken);

      console.log('[Mobile Auth] Login successful');
      return userData;
    } catch (error) {
      console.error('[Mobile Auth] Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);

      const { token: authToken, user: newUser } = response.data;

      setToken(authToken);
      setUser(newUser);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));

      return newUser;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      setUser(null);
      delete apiClient.defaults.headers.common['Authorization'];

      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUser = async (userData) => {
    try {
      const response = await apiClient.put('/users/profile', userData);
      const updatedUser = response.data;

      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Update failed');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    clearStoredAuth,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 