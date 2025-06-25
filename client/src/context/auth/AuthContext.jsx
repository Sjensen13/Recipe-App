import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../services/supabase/client';
import apiClient from '../../services/api/client';

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

  // Check if user is logged in on app start
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (usernameOrEmail, password) => {
    setLoading(true);
    try {
      // First, try to authenticate with the provided username/email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usernameOrEmail, // Try as email first
        password
      });

      if (error) {
        // If email login fails, try username login through our API
        if (error.message.includes('Invalid login credentials')) {
          try {
            // Call our custom login endpoint that handles username lookup
            const response = await apiClient.post('/auth/login', {
              username: usernameOrEmail,
              password: password
            });

            if (response.data.success) {
              // Get the user's email from the response and login with Supabase
              const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
                email: response.data.email,
                password: password
              });

              if (supabaseError) {
                throw new Error(supabaseError.message);
              }

              setUser(supabaseData.user);
              return supabaseData.user;
            } else {
              throw new Error(response.data.message || 'Invalid credentials');
            }
          } catch (apiError) {
            throw new Error('Invalid username or password');
          }
        } else {
          throw new Error(error.message);
        }
      }

      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, userData = {}) => {
    setLoading(true);
    try {
      // First, create the user in Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData // This will be stored in user_metadata
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // If registration is successful, also create user record in custom users table
      if (data.user) {
        try {
          // Create user record in custom users table
          await apiClient.post('/auth/create-profile', {
            username: userData.username,
            name: userData.name,
            email: email
          });
        } catch (profileError) {
          console.warn('Failed to create user profile:', profileError);
          // Don't throw error here as the user is already created in Supabase auth
          // The database trigger should handle this automatically, but this is a backup
        }
      }

      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 